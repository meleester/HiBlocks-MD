/* # File BMD_parser.js
 */

/* ## Object BMDParser
 *
 * Block-Markdown parser.
 *
 * The provessorChain has to be ordred by priority level.
 */
function BMDBlockParser (){
    
    /* ### processorChain
     *
     * Ordered list of processors.
     */
    this.processorChain = [
        new BMDBreakpointProcessor(),
        new BMDBlankLineProcessor(),
        new BMDCodeProcessor(),
        new BMDSectionTitleProcessor(),
        new BMDNumberedListProcessor(),
        new BMDBulletedListProcessor(),
        new BMDTypedBlockProcessor("objectifs", "Objectifs"),
        new BMDTypedBlockProcessor("example", "Exemple"),
        new BMDTypedBlockProcessor("exercise", "Exercice"),
        new BMDTypedBlockProcessor("answer", "Corrigé"),
        new BMDTypedBlockProcessor("summary", "Résumé"),
        new BMDTypedBlockProcessor("help", "Aide"),
        new BMDTypedBlockProcessor("reminder", "Rappel"),
        new BMDTypedBlockProcessor("note", "Remarque"),
        new BMDTypedBlockProcessor("sandfirst", "Chapô"),
        new BMDTypedBlockProcessor("additional", "Compléments"),
        new BMDTableProcessor(),
        new BMDParagraphProcessor(),    
    ];
    
    /* ### Method parse()
     *
     * Consums entry src and calls successively all processor of the
     * processorChain.
     */
    this.parse= function(src){
        var node, tree, processor;
        tree = new BMDTree();
        do{
            for(var i = 0; i < this.processorChain.length; i++){
                processor = this.processorChain[i];
                [src, node] = processor.parse(src);
                if (node){
                    tree.push(node);
                    break;
                }
            }
        }while(node !== null);
        
        return tree;
    };
}

function BMD(){
    var _BMDBlockParser = new BMDBlockParser();
    BMDBlockParser = _BMDBlockParser;
}


/* ## Object BMDProcessor (virtual)
 * 
 * Base of the Processors Hierarchy.
 */
function BMDProcessor(){
}


/* ## Object BMDBlockProcessor (virtual) extends BMDProcessor
 * 
 * Base of the BlockProcessors Hierarchy.
 */
function BMDBlockProcessor(){
}
    BMDBlockProcessor.prototype = new BMDProcessor();


/* ## Object BMDBreakpointProcessor extends BMDBlockProcessor
 * 
 * Used for debug only.
 *
 * Stops the execution if /^@@\n/ sequence is found in entry src.
 */
function BMDBreakpointProcessor(){
    this.parse = function(src){
        var m;
        if ((m = /^@@\n/.exec(src))){
            src = src.substring(m[0].length);
            debugger;
            return [src, new BMDEmptyNode()];
        }
        return [src, null];
    };
}
    BMDBreakpointProcessor.prototype = new BMDBlockProcessor();


/* ## Object BMDBlankLineProcessor extends BMDBlockProcessor
 * 
 * Used for line counting only.
 */
function BMDBlankLineProcessor(){
    this.re = /^\n+/;
    
    this.parse = function(src){
        var m;
        if((m = this.re.exec(src))){
            src = src.substring(m[0].length);
            return [src, new BMDEmptyNode()];
        }
        return [src, null];
    };
}
   BMDBlankLineProcessor.prototype = new BMDBlockProcessor();

/* ## Object BMDCodeProcessor extends BMDBlockProcessor
 *
 * Method parse() analyses entry src and return a BMDCodeNode
 * if success.
 *
 * Example :
 *      ```{attributes list}
 *      // Hello Word!
 *      int main(){
 *          printf("Hello Word!);
 *          return 0;
 *      }
 *      ```
 */
function BMDCodeProcessor(){
    this.reStart = /^`{3,}[ \t]*(?:(\w+)[ \t]*)?(?:\{(.*)\})?\n/;
    this.reBody  = /^.*\n/;
    this.reEnd   = /^`{3,}\n+/;
    this.AttrListProcessor = new BMDAttrListProcessor();
    
    this.parse = function(src){
        var m, attrList, attrSrc, code;
        if (!(m = this.reStart.exec(src))){
            return [src, null];
        }
        attrSrc = "";
        if (m[1]){
            attrSrc += '.' + m[1] + ', ';
        }
        if (m[2]){
            attrSrc += m[2] + ', ';
        }
        src = src.substr(m[0].length);
        code = "";
        while (!(m = this.reEnd.exec(src)) && (m = this.reBody.exec(src))){
            code += m[0];
            src = src.substring(m[0].length);
        }
        if (m){
            src = src.substring(m[0].length);
        }
        [attrSrc, attrList] = this.AttrListProcessor.parse(attrSrc);
        return [src, new BMDCodeNode(code, attrList)];
    };
}
    BMDCodeProcessor.prototype = new BMDBlockProcessor();



/* ## Object BMDSectionTitleProcessor extends BMDBlockProcessor
 *
 * Method parse() analyses entry src and return a BMDSectionTitleNode
 * if success.
 *
 * Examples :
 *      \# Title level 1
 *
 *      \#\# Title level 2
 *
 *      \#\#\# Etc.
 */
function BMDSectionTitleProcessor(){
    
    this.re = /^(#+)[ \t]+(.+?)[ \t]*(?:\{(.*)\})?\n/;
    this.AttrListProcessor = new BMDAttrListProcessor();
    
    this.parse = function(src){
        var m, level, title, attrList, attrSrc;
        if (!(m = this.re.exec(src))){
            return [src, null];
        }
        src = src.substring(m[0].length);
        level = m[1].length;
        title = m[2];
        attrSrc = "";
        if (m[3]){
            attrSrc += m[3] + ', ';
        }
        [attrSrc, attrList] = this.AttrListProcessor.parse(attrSrc);
        if (!attrList.id){
            attrList.id = new BMDIdAttrNode(
                title.
                replace(/[ \-,]/g, '-').
                replace(/[#@&"'(§!)*$€%£`<>?,;.:\\\/+={\[}\]]/g, '').
                toLowerCase());
        }
        return [src, new BMDSectionTitleNode(level, InlineParse(title), attrList)]; 
    };
}
    BMDSectionTitleProcessor.prototype = new BMDBlockProcessor();



/* ## Object BMDListProcessor (virtual) extends BMDBlockProcessor
 *
 * Base of list traitment.
 *
 * Try coller's ItemProcessor and return a BMDListNode if success.
 */
function BMDListProcessor(){
    this.parse = function(src){
        var item, content, node;
        [src, item] = this.ItemProcessor.parse(src);
        if (!item) return [src, null];
        content = new BMDTree();
        //node = this.new_BMDListNode();
        do{
            //node.push(item);
            content.push(item);
            [src, item] = this.ItemProcessor.parse(src);
        }while(item);
        node = this.new_BMDListNode(content);
        return [src, node];
    };
}
    BMDListProcessor.prototype = new BMDBlockProcessor();

/* ## Object BMDBulletedListProcessor extends BMDListProcessor
 *
 * DMBListProcessor specialisation for bulleted list.
 */
function BMDBulletedListProcessor(){
    this.ItemProcessor = new BMDBulletedItemProcessor();
}
    BMDBulletedListProcessor.prototype = new BMDListProcessor();
    BMDBulletedListProcessor.prototype.new_BMDListNode = function(content){
        return new BMDBulletedListNode(content);
    };


/* ## Object BMDNumberedListProcessor extends BMDListProcessor
 *
 * DMBListProcessor specialisation for bulleted list.
 */
function BMDNumberedListProcessor(){
    this.ItemProcessor = new BMDNumberedItemProcessor();
}
    BMDNumberedListProcessor.prototype = new BMDListProcessor();
    BMDNumberedListProcessor.prototype.new_BMDListNode = function(content){
        return new BMDNumberedListNode(content);
    };


/* ## Object BMDItemProcessor (virtual) extends BMDBlockProcessor
 * 
 */
function BMDItemProcessor(){
    this.reBlank = /^(\n+)/;
    this.reBody  = /^(?: +|\t)([^\n]+\n)/;
    //this.contentParser = new BMDBlockParser();
    
    this.parse = function(src){
        var m, mark, content;
        if (!(m = this.reStart.exec(src))){
            return [src, null];
        }
        mark = m[1];
        src = src.substr(m[0].length);
        content = "";
        while ((m = this.reBody.exec(src)) || (m = this.reBlank.exec(src))){
            content += m[1];
            src = src.substring(m[0].length);
        }
        content  = BMDBlockParser.parse(content);
        //content  = this.contentParser.parse(content);
        return [src, new BMDItemNode(mark, content)];
    };
}
    BMDItemProcessor.prototype = new BMDBlockProcessor();

/* ## Object BMDNumberedItemProcessor (virtual) extends BMDItemProcessor
 * 
 */
function BMDNumberedItemProcessor(){
    this.reStart = /^(\d+|[a-zA-Z]{1,2})[.\-\/\)]/;
}
    BMDNumberedItemProcessor.prototype = new BMDItemProcessor();

/* ## Object BMDBulletedItemProcessor (virtual) extends BMDItemProcessor
 * 
 */
function BMDBulletedItemProcessor(){
    this.reStart = /^([.\-+*])/;
}
    BMDBulletedItemProcessor.prototype = new BMDItemProcessor();



/* ## Object BMDBasicTypedBlockProcessor (virtual) extends BMDBlockProcessor
 *
 * 
 */
function BMDBasicTypedBlockProcessor(){
    this.reBlank = /^(\n+)/;
    this.reBody  = /^\t([^\n]+\n)/;
    this.AttrListProcessor = new BMDAttrListProcessor();
    //this.contentParser = new BMDBlockParser();
    
    this.parse = function(src){
        var m, title, attrList, attrSrc, content;
        if (!(m = this.reStart.exec(src))){
            return [src, null];
        }
        title = m[1];
        attrSrc = '.' + this.klass + ', ';
        if (m[2]){
            attrSrc += m[2] + ', ';
        }
        src = src.substr(m[0].length);
        content = "";
        while ((m = this.reBody.exec(src)) || (m = this.reBlank.exec(src))){
            content += m[1];
            src = src.substring(m[0].length);
        }
        content  = BMDBlockParser.parse(content);
        //content  = this.contentParser.parse(content);
        [attrSrc, attrList] = this.AttrListProcessor.parse(attrSrc);
        return [src, new BMDTypedBlockNode(this.keyword, InlineParse(title), content, attrList)];
    };
}
    BMDBasicTypedBlockProcessor.prototype = new BMDBlockProcessor();

/* ## Object BMDTypedBlockProcessor extends BMDBasicTypedBlockProcessor
 *
 * 
 */
function BMDTypedBlockProcessor(klass, keyword){
    this.klass = klass;
    this.keyword = keyword;
    this.reStart = new RegExp("^("+ keyword +"(?: .*)?):[ \t]*(?:\\{(.*)\\})?\\n", "");
}
    BMDTypedBlockProcessor.prototype = new  BMDBasicTypedBlockProcessor();

/* Object BMDTableProcessor extends BMDBlockProcessor
 *
 * Example :
 *     |   Loi             | Nom de base dans R | Arguments       | Exemple               |
 *     |-------------------|--------------------|-----------------|-----------------------|
 *     | Binomiale         | binom( )           | ..., size, prob |                       |
 *     | Géométrique       | geom( )            | ..., prob       |  [ici](#exempleGeo)   |
 *     | Poisson           | pois( )            | ..., lambda     |  [ici](#exemplePois)  |
 *     | hypergéométriques | hyper( )           | ..., m, n, k    |  [ici](#exempleHyper) |
 *     
 */
function BMDTableProcessor(){
    this.parse = function(src){
        var content, lines, lineNode, tmp;
        content = new BMDTree();
        lines = new BMDTree();
        tmp = src;
        while(1){
            if ((m = /^([|]-+?)+[|]\n/.exec(tmp))){
                if (lines.length()){
                    content.push(new BMDTableHeaderNode(lines));
                    lines = new BMDTree();
                }
                tmp = tmp.substring(m[0].length);
            }
            [tmp, lineNode] = bmdTableLineProcessor.parse(tmp);
            if(!lineNode) break;
            lines.push(lineNode);
        }
        if (lines.length()){
            content.push(new BMDTableBodyNode(lines));
        }
        if (!content.length()){
            return [src, null];
        }
        return [tmp, new BMDTableNode(content)];
    };
}
    BMDTableProcessor.prototype = new  BMDBlockProcessor();

function BMDTableHLineProcessor(){
    this.parse = function(src){
        var m;
        if(!(m = /^([|]-*?)+[|]\n/.exec(src))){
            return [src, null];
        }
        src = src.substring(m[0].length);
        return [src, true];
    }; 
}
    BMDTableHLineProcessor.prototype = new  BMDBlockProcessor();
    bmdTableHLineProcessor = new BMDTableLineProcessor();
    
function BMDTableLineProcessor(){
    
    this.parse = function(src){
        var content, cellNode, tmp;
        content = new BMDTree();
        tmp = src;
        while(1){
            [tmp, cellNode] = bmdTableCellProcessor.parse(tmp);
            if(!cellNode) break;
            content.push(cellNode);
        }
        if (!content.length()){
            return [src, null];
        }
        if (!(m = /^[|]\n/.exec(tmp))){
            return [src, null];
        }
        tmp = tmp.substring(m[0].length);
        return [tmp, new BMDTableLineNode(content)];
    };
}
    BMDTableLineProcessor.prototype = new  BMDBlockProcessor();
    bmdTableLineProcessor = new BMDTableLineProcessor();
    

function BMDTableCellProcessor(){
    this.parse = function(src){
        var m, content;
        if(!(m = /^[|](.*?)(?=[|])/.exec(src))){
            return [src, null];
        }
        content = m[1];
        src = src.substring(m[0].length);
        return [src, new BMDTableCellNode(InlineParse(content))];
    };    
}
    BMDTableCellProcessor.prototype = new  BMDBlockProcessor();
    bmdTableCellProcessor = new BMDTableCellProcessor();

/* Object BMDParagraphProcessor extends BMDBlockProcessor
 *
 * Method parse() analyses entry src and return a BMDParagrapheNode
 * if success.
 */
function BMDParagraphProcessor() {
    
    this.re = /^[^\t\n ].+\n/;
    
    this.parse =  function(src){
        var m, content;
        content = "";
        while((m = this.re.exec(src))){
            content += m[0];
            src = src.substring(m[0].length);
        }
        if (content.length){
            return [src, new BMDParagraphNode(InlineParse(content))];
        }
        return [src, null];
    };
}
    BMDParagraphProcessor.prototype = new BMDBlockProcessor();


/* Object BMDAttrListProcessor extends BMDBlockProcessor
 *
 * Method parse() analyses entry src and return a BMDArgList
 * if success.
 */
function BMDAttrListProcessor(){
    this.reIdAttr    = /^[ \t]*[#]([\-\w]+)[ \t]*,/;
    this.reClassAttr = /^[ \t]*[.]([\-\w]+)[ \t]*,/;
    this.reOtherAttr = /^[ \t]*([\-\w]+)[ \t]*=[ \t]*(.*?),/;
    
    this.parse = function(src){
        var m, content, klass, id;
        klass = null;
        id = null;
        content = new BMDTree();
        do{
            m = null;
            if ((m = this.reIdAttr.exec(src))){
                if (!id) id = new BMDIdAttrNode(m[1]);
                src = src.substring(m[0].length);
            } else if ((m = this.reClassAttr.exec(src))){
                if (!klass) klass = new BMDClassAttrNode(m[1]);
                else klass.add(m[1]);
                src = src.substring(m[0].length);
            } else if ((m = this.reOtherAttr.exec(src))){
                content.push(new BMDAttrNode(m[1], m[2]));
                src = src.substring(m[0].length);
            }
        }while(m);
        return [src, new BMDAttrListNode(id, klass, content)];
    };
}
    BMDAttrListProcessor.prototype = new BMDBlockProcessor();



function InlineParse(src){
    return src.
    replace(/`(.*?)`/g, function(m, p1){
        return '<code>' + p1 + '</code>';
    }).
    replace(/[$]{2}(.*?)[$]{2}/g, function(m, p1){
        return '<span class="math">\\['+ p1 +'\\]</span>';
    }).
    replace(/[$](.*?)[$]/g, function(m, p1){
        return '<span class="math">\\('+ p1 +'\\)</span>';
    }).
    replace(/!\[(.*?)\]\((.*?)\)/g, function(m, p1, p2){
        return '<img src="' + p2 + '" alt="' + p1 + '" />';
    }).
    replace(/\[(.*?)\]\((.*?)\)/g, function(m, p1, p2){
        //return '<a href="' + p2 + '">' + p1 + '</a>';
        return '<a onclick="showBlock(\''+p2+'\')">&#91;' + p1 + '&#93;</a>';
    }).replace(/[*]{2}(.+?)[*]{2}/g, function(m, p1){
        return '<strong>' + p1 + '</strong>';
    }).replace(/[*](.+?)[*]/g, function(m, p1){
        return '<em>' + p1 + '</em>';
    });
}



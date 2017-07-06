/* # File bmd_tree.js
 *
 * Topologie of document Tree.
 */

/* ## Object BMDNode (virtual)
 *
 * Base of the document Tree Hierarchy.
 */
function BMDNode(){
}
    /* ### Method toHtml()
     *
     * Default toHtml() conversion.
     */
    BMDNode.prototype.toHtml = function(){
        return '';
    };


/* ## Object BMDTree extends BMDNode
 *
 * Subtree of the document Tree.
 */
function BMDTree(){
    this.content = [];
}
    BMDTree.prototype = new BMDNode();
    /* ### Method push()
     *
     * Adds a node to the caller object.
     */
    BMDTree.prototype.push = function(node){
        this.content.push(node);        
    };
    /* ### Method length()
     *
     * Returns the numbre of nodes of the caller object.
     */
    BMDTree.prototype.length = function(){
        return this.content.length;        
    };
    
    /* ### Method toHtml()
     *
     */
    BMDTree.prototype.toHtml = function(){
        var txt = "";
        this.content.forEach(function(node){
                txt += node.toHtml();
            }
        );
        return txt;
    };


/* ## Object BMDEmptyNode extends BMDNode
 *
 * Empty node of the document Tree.
 *
 * Used by BMDBreakpointProcessor and BMDBlankLineProcessor.
 */
function BMDEmptyNode(){
}
    BMDEmptyNode.prototype = new BMDNode();


/* ## Object BMDCodeNode extends BMDNode
 *
 * Represents a block of code.
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
function BMDCodeNode(code, attrList){
    this.attrList = attrList;
    this.code = code;
}
    BMDCodeNode.prototype = new BMDNode();
    /* ### Method toHtml()
     *
     */
    BMDCodeNode.prototype.toHtml = function (){
        var txt;
        txt = '<pre><code';
        txt += this.attrList.toHtml();
        txt += '>' + this.code + '</code></pre>\n';
        return txt;
    };


/* ## Object BMDSectionTitleNode extends BMDNode
 * 
 *
 */
function BMDSectionTitleNode(level, title, attrList){
    this.level = level;
    this.title = title;
    this.attrList = attrList;
}
    BMDSectionTitleNode.prototype = new BMDNode();
    /* ### Method toHtml()
     *
     */
    BMDSectionTitleNode.prototype.toHtml = function(){
        var txt;
        txt = '<H' + this.level;
        txt += this.attrList.toHtml();
        txt += '>' + this.title + '</H'+ this.level+'>\n';
        return txt;
    };


/* ## Object BMDListNode (virtual) extends BMDNode
 * 
 *
 */
function BMDListNode(){
}
    BMDListNode.prototype = new BMDNode();

/* ## Object BMDItemNode (virtual) extends BMDNode
 * 
 * Represents a item of list.
 */
function BMDItemNode(mark, content){
    this.mark = mark;
    this.content = content;
}
    BMDItemNode.prototype = new BMDNode();
    /* ### Method toHtml()
     *
     */
    BMDItemNode.prototype.toHtml = function(){
        var txt = "";
        txt += '<li mark="' + this.mark +'">';
        txt += this.content.toHtml();
        txt += '</li>\n';
        return txt;
    };

/* ## Object BMDNumberedListNode extends BMDListNode
 * 
 *
 */
function BMDNumberedListNode(content){
    this.content = content;
}
    BMDNumberedListNode.prototype = new BMDListNode();
    /* ### Method toHtml()
     *
     */
    BMDNumberedListNode.prototype.toHtml = function(){
        var txt;
        txt = "<ol>\n";
        txt += this.content.toHtml();
        txt += "</ol>\n";
        return txt;
    };

/* ## Object BMDBulletedListNode extends BMDListNode
 * 
 *
 */
function BMDBulletedListNode(content){
    this.content = content;
}
    BMDBulletedListNode.prototype = new BMDListNode();
    /* ### Method toHtml()
     *
     */
    BMDBulletedListNode.prototype.toHtml = function(){
        var txt;
        txt = "<ul>\n";
        txt += this.content.toHtml();
        txt += "</ul>\n";
        return txt;
    };




/* ## Object BMDTypedBlockNode extends BMDNode
 * 
 *
 */
function BMDTypedBlockNode(keyword, title, content, attrList){
    this.keyword = keyword;
    this.title  = title;
    this.attrList  = attrList;
    this.content = content;
}
    BMDTypedBlockNode.prototype = new BMDNode();
    /* ### Method toHtml()
     *
     */
    BMDTypedBlockNode.prototype.toHtml = function(){
        var attr = this.attrList.toH();
        var txt = "";
        if (attr.behav == 'toggle'){
            txt += '<div class="toggle_block" id="' + attr.id + '" style="display: none;">\n';
            txt += '    <div id="' + attr.id +'_toggle_block" '+ this.attrList.toHtml() +'>\n';
            txt += '        <div class="block-header">' + this.title + '';
            txt += '        </div>\n';
            txt += '        <div class="block-body" id = "' + attr.id + '_content">\n';
            txt +=              this.content.toHtml();
            txt += '        </div>\n';
            txt += '        <div class="popup_close ref" id=' + attr.id + '_popup_close" '+
                            'onclick="hideBlock(\'#'+ attr.id +'\')">[X]</div>\n';
            txt += '    </div>\n';
            txt += '</div>\n';
        }else if (attr.behav == 'popup'){
            txt += '<div>\n';
            txt += '    <div class="popup_background" id="' + attr.id + '" style="display: none;">\n';
            txt += '        <div class="popup_block" id ="' + attr.id + '_popup_block" >\n';
            
            txt += '            <div id="' + attr.id +'_content" '+ this.attrList.toHtml() +'>\n';
            txt += '                <div class="block-header">' + this.title + '</div>\n';
            txt += '                <div class="block-body">\n';
            txt +=                      this.content.toHtml();
            txt += '                </div>\n';
            txt += '            </div>\n';
            
            txt += '            <div class="popup_close ref" id=' + attr.id + '_popup_close" '+
                                'onclick="hideBlock(\'#'+ attr.id +'\')">[X]</div>\n';
            txt += '        </div>\n';
            txt += '    </div>\n';
            txt += '</div>\n';
            //txt += '<style type="text/css">#%s_control:checked + #%s {display: block; z-index: %d}</style>\n' % (id, id, 500+self.popup_index) 
            //txt += '<style type="text/css">' + attr.id + '_popup_block {margin-top: %dpx; margin-left: %dpx}</style>\n' % (id, 50*(1+self.popup_index), 20*(1+self.popup_index))
        
        }else{
            txt += '<div' + this.attrList.toHtml() +'>\n';
            txt += '<div class="block-header">' + this.title + '</div>\n';
            txt += '<div class="block-body">\n';
            txt += this.content.toHtml();
            txt += '</div>\n';
            txt += '</div>\n';
        }
        return txt;
    };


/* ## Object BMDParagraphNode extends BMDNode
 *
 * 
 */
function BMDParagraphNode(content){
    this.content = content;
}
    BMDParagraphNode.prototype = new BMDNode();
    /* ### Method toHtml()
     *
     */
    BMDParagraphNode.prototype.toHtml = function (){
        return '<p>' + this.content + '</p>\n';
    };




/* ## Object BMDAttrListNode extends DMNNode
 *
 *
 */
function BMDAttrListNode(id, klass, content){
    this.id = id;
    this.klass = klass;
    this.others = content;
}
    BMDAttrListNode.prototype = new BMDNode();
    BMDAttrListNode.prototype.toH = function(){
        var rtn = {};
        if (this.id)    rtn['id'] = this.id.value;
        if (this.kalss) rtn['class'] = this.klass.value.join(" ");
        if (this.others) this.others.content.forEach(function(node){
            rtn[node.key] = node.value;
        });
        return rtn;
    };
    /* ### Method toHtml()
     *
     */
    BMDAttrListNode.prototype.toHtml = function (){
        var txt = "";
        if (this.id) txt += this.id.toHtml();
        if (this.klass) txt += this.klass.toHtml();
        txt += this.others.toHtml();
        return txt;
    };
    
function BMDAttrNode(key, value){
    this.key = key;
    this.value = value;
}
    BMDAttrNode.prototype = new BMDNode();
    /* ### Method toHtml()
     *
     */
    BMDAttrNode.prototype.toHtml = function (){
        return ' ' + this.key + '="' + this.value + '"';
    };
    
function BMDIdAttrNode(value){
    BMDAttrNode.call(this, "id", value);
}
    BMDIdAttrNode.prototype = new BMDAttrNode();
    
function BMDClassAttrNode(value){
    if (Array.isArray(value)){
        BMDAttrNode.call(this, "class", value);
    }else{
        BMDAttrNode.call(this, "class", [value]);
    }
}
    BMDClassAttrNode.prototype = new BMDAttrNode();
    BMDClassAttrNode.prototype.add = function(value){
        this.value.push(value);
    };
    /* ### Method toHtml()
     *
     */
    BMDClassAttrNode.prototype.toHtml = function (){
        return ' ' + this.key + '="' + this.value.join(" ") + '"';
    };
    

function BMDTableNode(content){
    this.content = content;
}
    BMDTableNode.prototype = new BMDNode();
    /* ### Method toHtml()
     *
     */
    BMDTableNode.prototype.toHtml = function (){
        return '<table>\n' + this.content.toHtml() + '</table>\n';
    };
    
function BMDTableHeaderNode(content){
    this.content = content;
}
    BMDTableHeaderNode.prototype = new BMDNode();
    BMDTableHeaderNode.prototype.toHtml = function (){
        BMDTableCellNode.prototype.tag = 'th';
        BMDTableLineNode.prototype.klass = 'header';
        return '\t<thead>\n' + this.content.toHtml() + '\t</thead>\n';
    };
    
    
function BMDTableBodyNode(content){
    this.content = content;
}
    BMDTableBodyNode.prototype = new BMDNode();
    BMDTableBodyNode.prototype.toHtml = function (){
        BMDTableCellNode.prototype.tag = 'td';
        BMDTableLineNode.prototype.klass = 'body';
        return '\t<tbody>\n' + this.content.toHtml() + '\t</tbody>\n';
    };

function BMDTableLineNode(content){
    this.content = content;
}
    BMDTableLineNode.prototype = new BMDNode();
    BMDTableLineNode.prototype.even = 'even';
    BMDTableLineNode.prototype.klass = 'body';
    /* ### Method toHtml()
     *
     */
    BMDTableLineNode.prototype.toHtml = function (){
        if (this.even == 'even'){
            BMDTableLineNode.prototype.even = 'odd';
        }else if (this.even == 'odd'){
            BMDTableLineNode.prototype.even = 'even';
        }
        return '\t\t<tr class="'+BMDTableLineNode.prototype.klass + ' ' + BMDTableLineNode.prototype.even+'">\n' + this.content.toHtml() + '\t\t</tr>\n';
    };

function BMDTableCellNode(content){
    this.content = content;
}
    BMDTableCellNode.prototype = new BMDNode();
    BMDTableCellNode.prototype.tag = 'td';
    /* ### Method toHtml()
     *
     */
    BMDTableCellNode.prototype.toHtml = function (){
        return '\t\t\t<'+this.tag+'>' + this.content + '</'+this.tag+'>\n';
    };






// Class BlockMD
BlockMD = {
    _tabSize : 4,
    _linesIndex : [],
    _srcBmd : "",
    _srcTree : [],
    
    bmdToHtml: function(src){
        this._srcBmd = src;
        this._srcBmd = this.normalizeWhitespace();
        //this._srcBmd = this.normalizeBlankLine();
        return this.showLineNumbers();
    },


    normalizeWhitespace: function(){
        var _indent_re = new RegExp('[ ]{' + this._tabSize + '}|[ ]{0,' + (this._tabSize - 1) + '}\t|\t', 'g');
        return this._srcBmd.
        replace(/\r\n/g, "\n").                         // Normalize Windows newline type
        replace(/\r/g, "\n").                           // Normalize OSX newline type
        replace(/( |\t)+(?:\n|$)/g, "\n").              // Normalize end of line spaces
        replace(/(?:^|\n)([ \t]+)/g, function(m, p1){   // Normalize indentation
                p1 = p1.replace(_indent_re, "\t");
                return "\n" + p1;
            }
        );
    },

    normalizeBlankLine: function(){
        this._src_bmd   += "\n\n";
        var _srcLineNbr  = 0;
        var _normLineNbr = 0;
        var _linesIndex  = this._linesIndex;
        return this._srcBmd.
        replace(/(^\n*|\n+)(.*)/g, function(m, p1, p2, offset){       // Normalize blank lines
                if (0 === offset){                          // Beginning of the src
                    _srcLineNbr  += p1.length;
                    _normLineNbr += 0;
                    _linesIndex[_normLineNbr] = _srcLineNbr;
                    return p2;
                }else if (p1.length > 1){                   // 2 newLines or more
                    _linesIndex[++_normLineNbr] = _srcLineNbr+1;
                    _srcLineNbr += p1.length;
                    _linesIndex[++_normLineNbr] = _srcLineNbr;
                    return "\n\n" + p2;
                }else{                                      // 1 newLine
                    _srcLineNbr  += 1;
                    _normLineNbr += 1;
                    _linesIndex[_normLineNbr] = _srcLineNbr;
                    return "\n" + p2;
                }
            }
        );
    },

    showLineNumbers: function(){
        var _linesIndex  = this._linesIndex;
        var _normLineNbr = -1;
        if (_linesIndex.length){
            return this._srcBmd.replace(/^|\n/g, function(m){
                    _normLineNbr++;
                    return m + ("0000" + _linesIndex[_normLineNbr]).slice(-4) + ":\t";
                }
            );
        }else{
            return this._srcBmd.replace(/^|\n/g, function(m){
                    _normLineNbr++;
                    return m + ("0000" + _normLineNbr).slice(-4) + ":\t";
                }
            );    
        }
    },


};



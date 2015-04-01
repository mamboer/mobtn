/*!
 * mobtn 1.0.0
 * Creative Morph Buttons Using CSS3 
 * @dependencies 
 *  1. classy.js <http://faso.me/classy>
 *  2. modernizr
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * built at 1427863305036 
 * Copyright 2015, FASO.ME <http://www.faso.me>
 */
(function (root, factory) {
    if (typeof exports === 'object'){
        module.exports = factory(require('./classy'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['classy'], factory );
    } else {
        // Browser globals
        root.MOBtn = factory(root.classy);
    }
}(this, function (classy) {

	var support = {transitions: Modernizr.csstransitions, animations : Modernizr.cssanimations },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
        transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'msTransition': 'MSTransitionEnd',
            'transition': 'transitionend'
        },
        transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ];

    function toggleClass( elems, cls){

        forEach(elems,function(elem){
            classy.toggle(elem,cls);
        });
    }

    function forEach(arr,fn){
        var len = arr.length;
        for(var i =0;i<len;i++ ){
            fn(arr[i]);
        }
    }

    function inArray(el,arr){
        var len = arr.length,
            ret = false;
        for(var i=0; i<len; i++){
            if(el === arr[i]){
                ret = true;
                break;
            }
        }
        return ret;
    }

	/**
	 * extend obj function
	 */
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}
    function MOBtn( el, options ) {
        this.el = el;
        this.options = extend( {}, this.options );
        extend( this.options, options );
        this._init();
    }

    MOBtn.prototype.options = {
        autoPos:true,//auto position the content element
        lastAnimatedPropertiesInClosing:['opacity'],
        lastAnimatedPropertiesInOpening:['width','height','left','top'],
        clActive: 'active',
        cssBtn: 'button',
        cssContent:'.mobtn-content',
        closeEl : '',
        onBeforeOpen : function() { return false; },
        onAfterOpen : function() { return false; },
        onBeforeClose : function() { return false; },
        onAfterClose : function() { return false; }
    };

    MOBtn.prototype._init = function() {
        // the button
        this.button = this.el.querySelector( this.options.cssBtn );
        // state
        this.expanded = false;
        // content el
        this.contentEl = this.el.querySelector( this.options.cssContent );
        // init events
        this._initEvents();
    };

    MOBtn.prototype._initEvents = function() {
        var self = this;
        // open
        this.button.addEventListener( 'click', function() { self.show(); } );
        // close
        if( this.options.closeEl !== '' ) {
            var closeEl = this.el.querySelector( this.options.closeEl );
            if( closeEl ) {
                closeEl.addEventListener( 'click', function() { self.hide(); } );
            }
        }
    };

    MOBtn.prototype.hide = function(){

        if( this.isAnimating || !this.expanded ) return false;
        this.isAnimating = true;

        var self = this,
            onEndTransitionFn = function( ev ) {
                if( ev.target !== this ) return false;

                if( support.transitions ) {
                    // open: first opacity then width/height/left/top
                    // close: first width/height/left/top then opacity
                    
                    if(  !inArray(ev.propertyName, self.options.lastAnimatedPropertiesInClosing) ) {
                        return false;
                    }
                    this.removeEventListener( transEndEventName, onEndTransitionFn );
                }
                self.isAnimating = false;
                
                // callback
                // remove class active (after closing)
                classy.remove( self.el, self.options.clActive );
                self.options.onAfterClose();
                self.expanded = false;
            };

        this.afterHideShow( onEndTransitionFn ); 
    };

    MOBtn.prototype.afterHideShow = function(onEndTransitionFn){
        var self = this;
        if( support.transitions ) {
            this.contentEl.addEventListener( transEndEventName, onEndTransitionFn );
        }
        else {
            onEndTransitionFn();
        }
            
        // set the left and top values of the contentEl (same like the button)
        var buttonPos = this.button.getBoundingClientRect();
        // need to reset
        classy.add( this.contentEl, 'no-transition' );
        if( this.options.autoPos){
            this.contentEl.style.left = 'auto';
            this.contentEl.style.top = 'auto';
        }
        // add/remove class "open" to the button wraper
        setTimeout( function() { 
            if( self.options.autoPos ){
                self.contentEl.style.left = buttonPos.left + 'px';
                self.contentEl.style.top = buttonPos.top + 'px';
            }
            if( self.expanded ) {
                classy.remove( self.contentEl, 'no-transition' );
                classy.remove( self.el, self.options.clActive );
                return;
            }
            setTimeout( function() { 
                classy.remove( self.contentEl, 'no-transition' );
                classy.add( self.el, self.options.clActive ); 
            }, 25 );

        }, 25 );

    };

    MOBtn.prototype.show = function(){
        if( this.isAnimating || this.expanded ) return false;    
        
        this.isAnimating = true;

        var self = this,
            onEndTransitionFn = function( ev ) {
                if( ev.target !== this ) return false;

                if( support.transitions ) {
                    // open: first opacity then width/height/left/top
                    // close: first width/height/left/top then opacity
                    
                    if( !inArray(ev.propertyName, self.options.lastAnimatedPropertiesInOpening) ){
                        return false;
                    }
                    this.removeEventListener( transEndEventName, onEndTransitionFn );
                }
                self.isAnimating = false;
                
                // callback
                self.options.onAfterOpen();

                self.expanded = true;
            };
            
        this.afterHideShow( onEndTransitionFn );
   
    };

    MOBtn.prototype.toggle = function() {

        if (this.expanded) return this.hide();

        this.show();
    };

    // add to global namespace
	return MOBtn;

}));

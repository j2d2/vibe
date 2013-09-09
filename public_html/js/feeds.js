
log('feeds.js');

// set global vars

//var feed_url = "http://pathinverse.wordpress.com/feed/";//"http://reclaiminghealth2013.wordpress.com/?feed=rss2";
var feed_url = "http://vibranceinhealth.wordpress.com/feed/";

var brief_desc_length = 50; //chars



// setup value model objects

var aCategories = [];
var aTags = [];
var aArticles = [];

var oArticle = function() {
    this.title = "";
    this.categories = [];
    this.tags = [];
    this.content = "";
    this.contentSnippet = "";
    this.pubDate = "";
    this.link = "";
    
    this.addCat = function(cat) {
        if (!valInArray(this.categories, cat)) {
            this.categories.push(cat);
        }
    };
    this.addTag = function(tag) {
        if (!valInArray(this.tags, tag)) {
            this.tags.push(tag);
        }
    };
    
    this.getSnippet = function(){  
        var shortened = getFirstXchars(this.contentSnippet, brief_desc_length); 
        return shortened; 
    };

};




var obj_ex = new (function() {
    this.prop = function() {
        console.log('obj_ex just ran.');
    }

    // init code goes here:
    this.prop();
});



$(function() {
     // ready
     console.log('feeds.js dom.ready!');
     
     
});


google.load("feeds", "1");

    function initialize() {
        console.log('google feed onload initialize');
      var feed = new google.feeds.Feed(feed_url);
      feed.setNumEntries(4);
      feed.load(function(result) {
          //console.log(result);
          var container = document.getElementById("feed");
          
        if (!result.error) {
            
          handleFeedResult(result.feed, container);
          
          /*for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            var div = document.createElement("div");
            div.appendChild(document.createTextNode(entry.title));
            container.appendChild(div);
          }*/
        } else {
            var div = document.createElement("div");
            div.className += " red";
            div.appendChild(document.createTextNode(result.error.message));
            container.appendChild(div);
        }
      });
    }
    google.setOnLoadCallback(initialize);
    


// HELPER functions


function idInArray(array, id) {
    for(var i=0;i<array.length;i++) {
        if(array[i][0].id === id) {
            return true;
        }
    }
    return false;
}
function valInArray(array, val) {
    return ($.inArray(val, array) > -1);
}


function decodeHtmlNumeric( str ) {
    return str.replace( /&#([0-9]{1,7});/g, function( g, m1 ){
        return String.fromCharCode( parseInt( m1, 10 ) );
    }).replace( /&#[xX]([0-9a-fA-F]{1,6});/g, function( g, m1 ){
        return String.fromCharCode( parseInt( m1, 16 ) );
    });
}

function getFirstXchars(str, x) {
    str = decodeHtmlNumeric(str);
    return str.slice(0,x);
}

// not used : getCategoriesHtmlFromEntry()
function getCategoriesHtmlFromEntry(entry) {
    //console.log('cat length = '+entry.categories.length);
    
    var div_wrap = document.createElement("div");
    div_wrap.className = "categories";
    
    for (var i = 0; i < entry.categories.length; i++) {
        
        var cat = entry.categories[i];
        //console.log(cat);
        var div = document.createElement("div");
        div.className = "category";
        div.appendChild(document.createTextNode(cat));
        div_wrap.appendChild(div);
    }
    
    return div_wrap;
}

function addCategoriesModelToEntry(entry, article) {
    //console.log('cat length = '+entry.categories.length);
    
    // from wordpress, the 1st category is the category, then it's tags...
    // **TODO:  unless you have multiple categories... then what?
    
    for (var i = 0; i < entry.categories.length; i++) {
        
        var cat = entry.categories[i];
        
        if (i === 0) {
            if (!valInArray(aCategories, cat)) {
                aCategories.push(cat);
            }
            
            article.addCat(cat);//;.categories.push(cat);
        } else {
            if (!valInArray(aTags, cat)) {
                aTags.push(cat);
            }
            article.tags.push(cat);
        }
        
    }
    
    return article;
}



// HANDLERS

function handleFeedResult(feed, container) {
    //console.log(feed.entries.length);
    //var container = document.getElementById("feed");
    
    createModelsFromFeed(feed);
    
    /*
    for (var i = 0; i < feed.entries.length; i++) {
        
        var entry = feed.entries[i];
        //console.log(entry);
        var div = document.createElement("div");
        div.className = "entry";
        div.appendChild(document.createTextNode(entry.title));
        
        var categories_html = getCategoriesHtmlFromEntry(entry);
        div.appendChild(categories_html);
        
        var short_desc = getFirstXchars(entry.contentSnippet, brief_desc_length);
        div.appendChild(document.createTextNode(short_desc));
        container.appendChild(div);
        
    }*/
    
    if (aArticles.length > 0) {
        // we got some models - do somethin with 'em
        renderModelsToPage(container);
        
    } else {
        var div = document.createElement("div");
        div.className = "error";
        div.appendChild(document.createTextNode("No Articles were captured. Refresh the page to try again."));
        container.appendChild(div);
    }
    
} // END handleFeedResult()



// CREATERS

function createModelsFromFeed(feed) {
    
    for (var i = 0; i < feed.entries.length; i++) {
        
        var entry = feed.entries[i];
        var me = new oArticle;
        me.title = entry.title;
        me.contentSnippet = entry.contentSnippet;
        me.content = entry.content;
        me.pubDate = entry.publishedDate;
        me.link = entry.link;
        
        addCategoriesModelToEntry(entry, me);
        //console.log(me);
        
        // add to global item container (models)
        aArticles.push(me);
    }
    console.log('createModelsFromFeed() - Done');
    console.log(aArticles);
    
    
} // END createModelFromFeed()


// RENDERES


function renderModelsToPage(container) {
    /*
     * var $head_link = $("<a/>", {
            "class": "cat-head-link",
            href: "#",
            text: me.title,
            click: function() {
              $( this ).toggleClass( "test" );
            }
        });
    
     * <div id="categories">
            <h1 class="ui-widget-header">Articles by Category</h1>
            <div class="catalog accordion">
              <h2><a href="#">Cat 1</a></h2>
              <div>
                <ul>
                  <li>Lolcat Shirt</li>
                  <li>Cheezeburger Shirt</li>
                  <li>Buckit Shirt</li>
                </ul>
        </div>
     */
    

    
    var $category_catalog = $('#categories.catalog');
    
    // loop thru aCategories
    for (var k = 0; k < aCategories.length; k++) {
        var $cat_head_link = $("<a/>", {
            "class": "cat-head-link",
            href: "#",
            text: aCategories[k]
        });
        
        var $h2_cat_head = $("<h2/>").append($cat_head_link);
        
        $($category_catalog).append($h2_cat_head);
        
        var $div_cat_list = $("<div/>");
        
        // loop for aArticles with that category and display within
        
        $div_cat_list.append(renderArticlesForCategory(aCategories[k])).appendTo($category_catalog);
    }
    
    
    var $tag_catalog = $('#tags.catalog');
    
    // loop thru aCategories
    for (var m = 0; m < aTags.length; m++) {
        var $tag_head_link = $("<a/>", {
            "class": "tag-head-link",
            href: "#",
            text: aTags[m]
        });
        
        var $h2_tag_head = $("<h2/>").append($tag_head_link);
        
        $($tag_catalog).append($h2_tag_head);
        
        var $div_tag_list = $("<div/>");
        
        // loop for aArticles with that tag and display within
        
        $div_tag_list.append(renderArticlesForTag(aTags[m])).appendTo($tag_catalog);
    }
    
    
    
    
    
    reRender();
    
}

function renderArticlesForCategory(cat) {
    //log('getArticlesFor '+cat);
    
    /*
     *  <ul id="gallery" class="gallery ui-helper-reset ui-helper-clearfix">
            <li class="ui-widget-content ui-corner-tr">
              <h5 class="ui-widget-header"><span icon></span> High Tatras</h5>
              <img src="images/high_tatras_min.jpg" alt="The peaks of High Tatras" width="96" height="72" />
              <a href="images/high_tatras.jpg" title="View larger image" class="ui-icon ui-icon-zoomin">View larger</a>
              <a href="link/to/trash/script/when/we/have/js/off" title="Delete this image" class="ui-icon ui-icon-trash">Delete image</a>
            </li>
        </ul>
     */
    
    
    var $list = $("<ul/>", {
            "class": "cat-block-list gallery block drag ui-helper-reset ui-helper-clearfix"
        });
        
    
    
    for (var i = 0; i < aArticles.length; i++) {
        
        var me = aArticles[i];
        
        //log(me.categories.length);
        for (var j = 0; j < me.categories.length; j++) {
            //log('j: '+me.categories[j]);
           
            
            if (me.categories[j] === cat) {
                //log('cat=j');
           
                var $span_icon = $("<span class=\"ui-icon ui-icon-arrow-4\"></span> ");
                
                var $h5 = $("<h5/>", {
                    "class": "ui-widget-header",
                    text: me.title
                });
                
                $($h5).prepend($span_icon);
                
                var $li = $("<li/>", {
                    "class": "cat-block-list-item ui-widget-content ui-corner-all"
                });
                
                 $($li).append($h5);
                 
                 var $brief = $("<div/>", {
                     "class": "block-desc", 
                     text: me.getSnippet()
                 });
                 
                 $($li).append($brief);
                
                $($li).append('<a href="#zoom" title="Preview" data-title="'+me.title+'" class="ui-icon ui-icon-zoomin">Preview</a>');

                $($li).append('<a href="#trash" title="Ignore" class="ui-icon ui-icon-trash">Ignore</a>');
                
                
                $($list).append($li);
                //log($list);
            }
            
            
            
        }
        
        
        
        /*
        me.title = entry.title;
        me.contentSnippet = entry.contentSnippet;
        me.content = entry.content;
        me.pubDate = entry.publishedDate;
        me.link = entry.link;
        
        addCategoriesModelToEntry(entry, me);
        //console.log(me);
        
        // add to global item container (models)
        models.push(me);*/
    }
    
    return $list;
    
}

function renderArticlesForTag(cat) {
    //log('getArticlesFor '+cat);
    var $list = $("<ul/>", {
            "class": "tag-block-list"
        });
    
    for (var i = 0; i < aArticles.length; i++) {
        
        var me = aArticles[i];
        
        //log(me.categories.length);
        for (var j = 0; j < me.tags.length; j++) {
            //log('j: '+me.categories[j]);
            
            if (me.tags[j] === cat) {
                //log('cat=j');
                var $li = $("<li/>", {
                    text: me.title
                });
                
                $($list).append($li);
                //log($list);
            }
            
        }
        
    }
    
    return $list;
    
}
// ==UserScript==
// @name                show tip on cc98.org
// @version        0.4.1
// @author chenyuan
// @namespace	        cc98.tech
// @description	        show tip on cc98.org recent page, by requesting cc98.tech
// @include		https://www.cc98.org/*
// @connect cc98.tech
// @grant        GM_xmlhttpRequest
// @grant GM_addStyle
// ==/UserScript==

/** $Id: domLib.js 2321 2006-06-12 06:45:41Z dallen $ */
// {{{ license

/*
 * Copyright 2002-2005 Dan Allen, Mojavelinux.com (dan.allen@mojavelinux.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// }}}
// {{{ intro

/**
 * Title: DOM Library Core
 * Version: 0.70
 *
 * Summary:
 * A set of commonly used functions that make it easier to create javascript
 * applications that rely on the DOM.
 *
 * Updated: 2005/05/17
 *
 * Maintainer: Dan Allen <dan.allen@mojavelinux.com>
 * Maintainer: Jason Rust <jrust@rustyparts.com>
 *
 * License: Apache 2.0
 */

// }}}
// {{{ global constants (DO NOT EDIT)

// -- Browser Detection --
var domLib_userAgent = navigator.userAgent.toLowerCase();
var domLib_isMac = navigator.appVersion.indexOf('Mac') != -1;
var domLib_isWin = domLib_userAgent.indexOf('windows') != -1;
// NOTE: could use window.opera for detecting Opera
var domLib_isOpera = domLib_userAgent.indexOf('opera') != -1;
var domLib_isOpera7up = domLib_userAgent.match(/opera.(7|8)/i);
var domLib_isSafari = domLib_userAgent.indexOf('safari') != -1;
var domLib_isKonq = domLib_userAgent.indexOf('konqueror') != -1;
// Both konqueror and safari use the khtml rendering engine
var domLib_isKHTML = (domLib_isKonq || domLib_isSafari || domLib_userAgent.indexOf('khtml') != -1);
var domLib_isIE = (!domLib_isKHTML && !domLib_isOpera && (domLib_userAgent.indexOf('msie 5') != -1 || domLib_userAgent.indexOf('msie 6') != -1 || domLib_userAgent.indexOf('msie 7') != -1));
var domLib_isIE5up = domLib_isIE;
var domLib_isIE50 = (domLib_isIE && domLib_userAgent.indexOf('msie 5.0') != -1);
var domLib_isIE55 = (domLib_isIE && domLib_userAgent.indexOf('msie 5.5') != -1);
var domLib_isIE5 = (domLib_isIE50 || domLib_isIE55);
// safari and konq may use string "khtml, like gecko", so check for destinctive /
var domLib_isGecko = domLib_userAgent.indexOf('gecko/') != -1;
var domLib_isMacIE = (domLib_isIE && domLib_isMac);
var domLib_isIE55up = domLib_isIE5up && !domLib_isIE50 && !domLib_isMacIE;
var domLib_isIE6up = domLib_isIE55up && !domLib_isIE55;

// -- Browser Abilities --
var domLib_standardsMode = (document.compatMode && document.compatMode == 'CSS1Compat');
var domLib_useLibrary = (domLib_isOpera7up || domLib_isKHTML || domLib_isIE5up || domLib_isGecko || domLib_isMacIE || document.defaultView);
// fixed in Konq3.2
var domLib_hasBrokenTimeout = (domLib_isMacIE || (domLib_isKonq && domLib_userAgent.match(/konqueror\/3.([2-9])/) == null));
var domLib_canFade = (domLib_isGecko || domLib_isIE || domLib_isSafari || domLib_isOpera);
var domLib_canDrawOverSelect = (domLib_isMac || domLib_isOpera || domLib_isGecko);
var domLib_canDrawOverFlash = (domLib_isMac || domLib_isWin);

// -- Event Variables --
var domLib_eventTarget = domLib_isIE ? 'srcElement' : 'currentTarget';
var domLib_eventButton = domLib_isIE ? 'button' : 'which';
var domLib_eventTo = domLib_isIE ? 'toElement' : 'relatedTarget';
var domLib_stylePointer = domLib_isIE ? 'hand' : 'pointer';
// NOTE: a bug exists in Opera that prevents maxWidth from being set to 'none', so we make it huge
var domLib_styleNoMaxWidth = domLib_isOpera ? '10000px' : 'none';
var domLib_hidePosition = '-1000px';
var domLib_scrollbarWidth = 14;
var domLib_autoId = 1;
var domLib_zIndex = 100;

// -- Detection --
var domLib_collisionElements;
var domLib_collisionsCached = false;

var domLib_timeoutStateId = 0;
var domLib_timeoutStates = new Hash();

// }}}
// {{{ DOM enhancements

if (!document.ELEMENT_NODE)
{
    document.ELEMENT_NODE = 1;
    document.ATTRIBUTE_NODE = 2;
    document.TEXT_NODE = 3;
    document.DOCUMENT_NODE = 9;
    document.DOCUMENT_FRAGMENT_NODE = 11;
}

function domLib_clone(obj)
{
    var copy = {};
    for (var i in obj)
    {
        var value = obj[i];
        try
        {
            if (value != null && typeof(value) == 'object' && value != window && !value.nodeType)
            {
                copy[i] = domLib_clone(value);
            }
            else
            {
                copy[i] = value;
            }
        }
        catch(e)
        {
            copy[i] = value;
        }
    }

    return copy;
}

// }}}
// {{{ class Hash()

function Hash()
{
    this.length = 0;
    this.numericLength = 0;
    this.elementData = [];
    for (var i = 0; i < arguments.length; i += 2)
    {
        if (typeof(arguments[i + 1]) != 'undefined')
        {
            this.elementData[arguments[i]] = arguments[i + 1];
            this.length++;
            if (arguments[i] == parseInt(arguments[i]))
            {
                this.numericLength++;
            }
        }
    }
}

// using prototype as opposed to inner functions saves on memory
Hash.prototype.get = function(in_key)
{
    if (typeof(this.elementData[in_key]) != 'undefined') {
        return this.elementData[in_key];
    }

    return null;
}

Hash.prototype.set = function(in_key, in_value)
{
    if (typeof(in_value) != 'undefined')
    {
        if (typeof(this.elementData[in_key]) == 'undefined')
        {
            this.length++;
            if (in_key == parseInt(in_key))
            {
                this.numericLength++;
            }
        }

        return this.elementData[in_key] = in_value;
    }

    return false;
}

Hash.prototype.remove = function(in_key)
{
    var tmp_value;
    if (typeof(this.elementData[in_key]) != 'undefined')
    {
        this.length--;
        if (in_key == parseInt(in_key))
        {
            this.numericLength--;
        }

        tmp_value = this.elementData[in_key];
        delete this.elementData[in_key];
    }

    return tmp_value;
}

Hash.prototype.size = function()
{
    return this.length;
}

Hash.prototype.has = function(in_key)
{
    return typeof(this.elementData[in_key]) != 'undefined';
}

Hash.prototype.find = function(in_obj)
{
    for (var tmp_key in this.elementData)
    {
        if (this.elementData[tmp_key] == in_obj)
        {
            return tmp_key;
        }
    }

    return null;
}

Hash.prototype.merge = function(in_hash)
{
    for (var tmp_key in in_hash.elementData)
    {
        if (typeof(this.elementData[tmp_key]) == 'undefined')
        {
            this.length++;
            if (tmp_key == parseInt(tmp_key))
            {
                this.numericLength++;
            }
        }

        this.elementData[tmp_key] = in_hash.elementData[tmp_key];
    }
}

Hash.prototype.compare = function(in_hash)
{
    if (this.length != in_hash.length)
    {
        return false;
    }

    for (var tmp_key in this.elementData)
    {
        if (this.elementData[tmp_key] != in_hash.elementData[tmp_key])
        {
            return false;
        }
    }

    return true;
}

// }}}
// {{{ domLib_isDescendantOf()

function domLib_isDescendantOf(in_object, in_ancestor, in_bannedTags)
{
    if (in_object == null)
    {
        return false;
    }

    if (in_object == in_ancestor)
    {
        return true;
    }

    if (typeof(in_bannedTags) != 'undefined' &&
        (',' + in_bannedTags.join(',') + ',').indexOf(',' + in_object.tagName + ',') != -1)
    {
        return false;
    }

    while (in_object != document.documentElement)
    {
        try
        {
            if ((tmp_object = in_object.offsetParent) && tmp_object == in_ancestor)
            {
                return true;
            }
            else if ((tmp_object = in_object.parentNode) == in_ancestor)
            {
                return true;
            }
            else
            {
                in_object = tmp_object;
            }
        }
        // in case we get some wierd error, assume we left the building
        catch(e)
        {
            return false;
        }
    }

    return false;
}

// }}}
// {{{ domLib_detectCollisions()

/**
 * For any given target element, determine if elements on the page
 * are colliding with it that do not obey the rules of z-index.
 */
function domLib_detectCollisions(in_object, in_recover, in_useCache)
{
    // the reason for the cache is that if the root menu is built before
    // the page is done loading, then it might not find all the elements.
    // so really the only time you don't use cache is when building the
    // menu as part of the page load
    if (!domLib_collisionsCached)
    {
        var tags = [];

        if (!domLib_canDrawOverFlash)
        {
            tags[tags.length] = 'object';
        }

        if (!domLib_canDrawOverSelect)
        {
            tags[tags.length] = 'select';
        }

        domLib_collisionElements = domLib_getElementsByTagNames(tags, true);
        domLib_collisionsCached = in_useCache;
    }

    // if we don't have a tip, then unhide selects
    if (in_recover)
    {
        for (var cnt = 0; cnt < domLib_collisionElements.length; cnt++)
        {
            var thisElement = domLib_collisionElements[cnt];

            if (!thisElement.hideList)
            {
                thisElement.hideList = new Hash();
            }

            thisElement.hideList.remove(in_object.id);
            if (!thisElement.hideList.length)
            {
                domLib_collisionElements[cnt].style.visibility = 'visible';
                if (domLib_isKonq)
                {
                    domLib_collisionElements[cnt].style.display = '';
                }
            }
        }

        return;
    }
    else if (domLib_collisionElements.length == 0)
    {
        return;
    }

    // okay, we have a tip, so hunt and destroy
    var objectOffsets = domLib_getOffsets(in_object);

    for (var cnt = 0; cnt < domLib_collisionElements.length; cnt++)
    {
        var thisElement = domLib_collisionElements[cnt];

        // if collision element is in active element, move on
        // WARNING: is this too costly?
        if (domLib_isDescendantOf(thisElement, in_object))
        {
            continue;
        }

        // konqueror only has trouble with multirow selects
        if (domLib_isKonq &&
            thisElement.tagName == 'SELECT' &&
            (thisElement.size <= 1 && !thisElement.multiple))
        {
            continue;
        }

        if (!thisElement.hideList)
        {
            thisElement.hideList = new Hash();
        }

        var selectOffsets = domLib_getOffsets(thisElement);
        var center2centerDistance = Math.sqrt(Math.pow(selectOffsets.get('leftCenter') - objectOffsets.get('leftCenter'), 2) + Math.pow(selectOffsets.get('topCenter') - objectOffsets.get('topCenter'), 2));
        var radiusSum = selectOffsets.get('radius') + objectOffsets.get('radius');
        // the encompassing circles are overlapping, get in for a closer look
        if (center2centerDistance < radiusSum)
        {
            // tip is left of select
            if ((objectOffsets.get('leftCenter') <= selectOffsets.get('leftCenter') && objectOffsets.get('right') < selectOffsets.get('left')) ||
                // tip is right of select
                (objectOffsets.get('leftCenter') > selectOffsets.get('leftCenter') && objectOffsets.get('left') > selectOffsets.get('right')) ||
                // tip is above select
                (objectOffsets.get('topCenter') <= selectOffsets.get('topCenter') && objectOffsets.get('bottom') < selectOffsets.get('top')) ||
                // tip is below select
                (objectOffsets.get('topCenter') > selectOffsets.get('topCenter') && objectOffsets.get('top') > selectOffsets.get('bottom')))
            {
                thisElement.hideList.remove(in_object.id);
                if (!thisElement.hideList.length)
                {
                    thisElement.style.visibility = 'visible';
                    if (domLib_isKonq)
                    {
                        thisElement.style.display = '';
                    }
                }
            }
            else
            {
                thisElement.hideList.set(in_object.id, true);
                thisElement.style.visibility = 'hidden';
                if (domLib_isKonq)
                {
                    thisElement.style.display = 'none';
                }
            }
        }
    }
}

// }}}
// {{{ domLib_getOffsets()

function domLib_getOffsets(in_object, in_preserveScroll)
{
    if (typeof(in_preserveScroll) == 'undefined') {
        in_preserveScroll = false;
    }

    var originalObject = in_object;
    var originalWidth = in_object.offsetWidth;
    var originalHeight = in_object.offsetHeight;
    var offsetLeft = 0;
    var offsetTop = 0;

    while (in_object)
    {
        offsetLeft += in_object.offsetLeft;
        offsetTop += in_object.offsetTop;
        in_object = in_object.offsetParent;
        // consider scroll offset of parent elements
        if (in_object && !in_preserveScroll)
        {
            offsetLeft -= in_object.scrollLeft;
            offsetTop -= in_object.scrollTop;
        }
    }

    // MacIE misreports the offsets (even with margin: 0 in body{}), still not perfect
    if (domLib_isMacIE) {
        offsetLeft += 10;
        offsetTop += 10;
    }

    return new Hash(
        'left',		offsetLeft,
        'top',		offsetTop,
        'right',	offsetLeft + originalWidth,
        'bottom',	offsetTop + originalHeight,
        'leftCenter',	offsetLeft + originalWidth/2,
        'topCenter',	offsetTop + originalHeight/2,
        'radius',	Math.max(originalWidth, originalHeight)
    );
}

// }}}
// {{{ domLib_setTimeout()

function domLib_setTimeout(in_function, in_timeout, in_args)
{
    if (typeof(in_args) == 'undefined')
    {
        in_args = [];
    }

    if (in_timeout == -1)
    {
        // timeout event is disabled
        return 0;
    }
    else if (in_timeout == 0)
    {
        in_function(in_args);
        return 0;
    }

    // must make a copy of the arguments so that we release the reference
    var args = domLib_clone(in_args);

    if (!domLib_hasBrokenTimeout)
    {
        return setTimeout(function() { in_function(args); }, in_timeout);
    }
    else
    {
        var id = domLib_timeoutStateId++;
        var data = new Hash();
        data.set('function', in_function);
        data.set('args', args);
        domLib_timeoutStates.set(id, data);

        data.set('timeoutId', setTimeout('domLib_timeoutStates.get(' + id + ').get(\'function\')(domLib_timeoutStates.get(' + id + ').get(\'args\')); domLib_timeoutStates.remove(' + id + ');', in_timeout));
        return id;
    }
}

// }}}
// {{{ domLib_clearTimeout()

function domLib_clearTimeout(in_id)
{
    if (!domLib_hasBrokenTimeout)
    {
        if (in_id > 0) {
            clearTimeout(in_id);
        }
    }
    else
    {
        if (domLib_timeoutStates.has(in_id))
        {
            clearTimeout(domLib_timeoutStates.get(in_id).get('timeoutId'))
            domLib_timeoutStates.remove(in_id);
        }
    }
}

// }}}
// {{{ domLib_getEventPosition()

function domLib_getEventPosition(in_eventObj)
{
    var eventPosition = new Hash('x', 0, 'y', 0, 'scrollX', 0, 'scrollY', 0);

    // IE varies depending on standard compliance mode
    if (domLib_isIE)
    {
        var doc = (domLib_standardsMode ? document.documentElement : document.body);
        // NOTE: events may fire before the body has been loaded
        if (doc)
        {
            eventPosition.set('x', in_eventObj.clientX + doc.scrollLeft);
            eventPosition.set('y', in_eventObj.clientY + doc.scrollTop);
            eventPosition.set('scrollX', doc.scrollLeft);
            eventPosition.set('scrollY', doc.scrollTop);
        }
    }
    else
    {
        eventPosition.set('x', in_eventObj.pageX);
        eventPosition.set('y', in_eventObj.pageY);
        eventPosition.set('scrollX', in_eventObj.pageX - in_eventObj.clientX);
        eventPosition.set('scrollY', in_eventObj.pageY - in_eventObj.clientY);
    }

    return eventPosition;
}

// }}}
// {{{ domLib_cancelBubble()

function domLib_cancelBubble(in_event)
{
    var eventObj = in_event ? in_event : window.event;
    eventObj.cancelBubble = true;
}

// }}}
// {{{ domLib_getIFrameReference()

function domLib_getIFrameReference(in_frame)
{
    if (domLib_isGecko || domLib_isIE)
    {
        return in_frame.frameElement;
    }
    else
    {
        // we could either do it this way or require an id on the frame
        // equivalent to the name
        var name = in_frame.name;
        if (!name || !in_frame.parent)
        {
            return null;
        }

        var candidates = in_frame.parent.document.getElementsByTagName('iframe');
        for (var i = 0; i < candidates.length; i++)
        {
            if (candidates[i].name == name)
            {
                return candidates[i];
            }
        }

        return null;
    }
}

// }}}
// {{{ domLib_getElementsByClass()

function domLib_getElementsByClass(in_class)
{
    var elements = domLib_isIE5 ? document.all : document.getElementsByTagName('*');
    var matches = [];
    var cnt = 0;
    for (var i = 0; i < elements.length; i++)
    {
        if ((" " + elements[i].className + " ").indexOf(" " + in_class + " ") != -1)
        {
            matches[cnt++] = elements[i];
        }
    }

    return matches;
}

// }}}
// {{{ domLib_getElementsByTagNames()

function domLib_getElementsByTagNames(in_list, in_excludeHidden)
{
    var elements = [];
    for (var i = 0; i < in_list.length; i++)
    {
        var matches = document.getElementsByTagName(in_list[i]);
        for (var j = 0; j < matches.length; j++)
        {
            // skip objects that have nested embeds, or else we get "flashing"
            if (matches[j].tagName == 'OBJECT' && domLib_isGecko)
            {
                var kids = matches[j].childNodes;
                var skip = false;
                for (var k = 0; k < kids.length; k++)
                {
                    if (kids[k].tagName == 'EMBED')
                    {
                        skip = true;
                        break;
                    }
                }
                if (skip) continue;
            }

            if (in_excludeHidden && domLib_getComputedStyle(matches[j], 'visibility') == 'hidden')
            {
                continue;
            }

            elements[elements.length] = matches[j];
        }
    }

    return elements;
}

// }}}
// {{{ domLib_getComputedStyle()

function domLib_getComputedStyle(in_obj, in_property)
{
    if (domLib_isIE)
    {
        var humpBackProp = in_property.replace(/-(.)/, function (a, b) { return b.toUpperCase(); });
        return eval('in_obj.currentStyle.' + humpBackProp);
    }
    // getComputedStyle() is broken in konqueror, so let's go for the style object
    else if (domLib_isKonq)
    {
        //var humpBackProp = in_property.replace(/-(.)/, function (a, b) { return b.toUpperCase(); });
        return eval('in_obj.style.' + in_property);
    }
    else
    {
        return document.defaultView.getComputedStyle(in_obj, null).getPropertyValue(in_property);
    }
}

// }}}
// {{{ makeTrue()

function makeTrue()
{
    return true;
}

// }}}
// {{{ makeFalse()

function makeFalse()
{
    return false;
}

// }}}

/** $Id: domTT.js 2324 2006-06-12 07:06:39Z dallen $ */
// {{{ license

/*
 * Copyright 2002-2005 Dan Allen, Mojavelinux.com (dan.allen@mojavelinux.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// }}}
// {{{ intro

/**
 * Title: DOM Tooltip Library
 * Version: 0.7.3
 *
 * Summary:
 * Allows developers to add custom tooltips to the webpages.  Tooltips are
 * generated using the domTT_activate() function and customized by setting
 * a handful of options.
 *
 * Maintainer: Dan Allen <dan.allen@mojavelinux.com>
 * Contributors:
 * 		Josh Gross <josh@jportalhome.com>
 *		Jason Rust <jason@rustyparts.com>
 *
 * License: Apache 2.0
 * However, if you use this library, you earn the position of official bug
 * reporter :) Please post questions or problem reports to the newsgroup:
 *
 *   http://groups-beta.google.com/group/dom-tooltip
 *
 * If you are doing this for commercial work, perhaps you could send me a few
 * Starbucks Coffee gift dollars or PayPal bucks to encourage future
 * developement (NOT REQUIRED).  E-mail me for my snail mail address.

 *
 * Homepage: http://www.mojavelinux.com/projects/domtooltip/
 *
 * Newsgroup: http://groups-beta.google.com/group/dom-tooltip
 *
 * Freshmeat Project: http://freshmeat.net/projects/domtt/?topic_id=92
 *
 * Updated: 2005/07/16
 *
 * Supported Browsers:
 * Mozilla (Gecko), IE 5.5+, IE on Mac, Safari, Konqueror, Opera 7
 *
 * Usage:
 * Please see the HOWTO documentation.
**/

// }}}
// {{{ settings (editable)

// IE mouse events seem to be off by 2 pixels
var domTT_offsetX = (domLib_isIE ? -2 : 0);
var domTT_offsetY = (domLib_isIE ? 4 : 2);
var domTT_direction = 'southeast';
var domTT_mouseHeight = domLib_isIE ? 13 : 19;
var domTT_closeLink = 'X';
var domTT_closeAction = 'hide';
var domTT_activateDelay = 500;
var domTT_maxWidth = false;
var domTT_styleClass = 'domTT';
var domTT_fade = 'neither';
var domTT_lifetime = 0;
var domTT_grid = 0;
var domTT_trailDelay = 200;
var domTT_useGlobalMousePosition = true;
var domTT_postponeActivation = false;
var domTT_tooltipIdPrefix = '[domTT]';
var domTT_screenEdgeDetection = true;
var domTT_screenEdgePadding = 4;
var domTT_oneOnly = true;
var domTT_cloneNodes = false;
var domTT_detectCollisions = true;
var domTT_bannedTags = ['OPTION'];
var domTT_draggable = false;
if (typeof(domTT_dragEnabled) == 'undefined')
{
    domTT_dragEnabled = false;
}

// }}}
// {{{ globals (DO NOT EDIT)

var domTT_predefined = new Hash();
// tooltips are keyed on both the tip id and the owner id,
// since events can originate on either object
var domTT_tooltips = new Hash();
var domTT_lastOpened = 0;
var domTT_documentLoaded = false;
var domTT_mousePosition = null;

// }}}
// {{{ document.onmousemove

if (domLib_useLibrary && domTT_useGlobalMousePosition)
{
    document.onmousemove = function(in_event)
    {
        if (typeof(in_event) == 'undefined') { in_event = window.event; }

        domTT_mousePosition = domLib_getEventPosition(in_event);
        if (domTT_dragEnabled && domTT_dragMouseDown)
        {
            domTT_dragUpdate(in_event);
        }
    }
}

// }}}
// {{{ domTT_activate()

function domTT_activate(in_this, in_event)
{
    if (!domLib_useLibrary || (domTT_postponeActivation && !domTT_documentLoaded)) { return false; }

    // make sure in_event is set (for IE, some cases we have to use window.event)
    if (typeof(in_event) == 'undefined') { in_event = window.event;	}

    // don't allow tooltips on banned tags (such as OPTION)
    if (in_event != null) {
        var target = in_event.srcElement ? in_event.srcElement : in_event.target;
        if (target != null && (',' + domTT_bannedTags.join(',') + ',').indexOf(',' + target.tagName + ',') != -1)
        {
            return false;
        }
    }

    var owner = document.body;
    // we have an active event so get the owner
    if (in_event != null && in_event.type.match(/key|mouse|click|contextmenu/i))
    {
        // make sure we have nothing higher than the body element
        if (in_this.nodeType && in_this.nodeType != document.DOCUMENT_NODE)
        {
            owner = in_this;
        }
    }
    // non active event (make sure we were passed a string id)
    else
    {
        if (typeof(in_this) != 'object' && !(owner = domTT_tooltips.get(in_this)))
        {
            // NOTE: two steps to avoid "flashing" in gecko
            var embryo = document.createElement('div');
            owner = document.body.appendChild(embryo);
            owner.style.display = 'none';
            owner.id = in_this;
        }
    }

    // make sure the owner has a unique id
    if (!owner.id)
    {
        owner.id = '__autoId' + domLib_autoId++;
    }

    // see if we should only be opening one tip at a time
    // NOTE: this is not "perfect" yet since it really steps on any other
    // tip working on fade out or delayed close, but it get's the job done
    if (domTT_oneOnly && domTT_lastOpened)
    {
        domTT_deactivate(domTT_lastOpened);
    }

    domTT_lastOpened = owner.id;

    var tooltip = domTT_tooltips.get(owner.id);
    if (tooltip)
    {
        if (tooltip.get('eventType') != in_event.type)
        {
            if (tooltip.get('type') == 'greasy')
            {
                tooltip.set('closeAction', 'destroy');
                domTT_deactivate(owner.id);
            }
            else if (tooltip.get('status') != 'inactive')
            {
                return owner.id;
            }
        }
        else
        {
            if (tooltip.get('status') == 'inactive')
            {
                tooltip.set('status', 'pending');
                tooltip.set('activateTimeout', domLib_setTimeout(domTT_runShow, tooltip.get('delay'), [owner.id, in_event]));

                return owner.id;
            }
            // either pending or active, let it be
            else
            {
                return owner.id;
            }
        }
    }

    // setup the default options hash
    var options = new Hash(
        'caption',		'',
        'content',		'',
        'clearMouse',	true,
        'closeAction',	domTT_closeAction,
        'closeLink',	domTT_closeLink,
        'delay',		domTT_activateDelay,
        'direction',	domTT_direction,
        'draggable',	domTT_draggable,
        'fade',			domTT_fade,
        'fadeMax',		100,
        'grid',			domTT_grid,
        'id',			domTT_tooltipIdPrefix + owner.id,
        'inframe',		false,
        'lifetime',		domTT_lifetime,
        'offsetX',		domTT_offsetX,
        'offsetY',		domTT_offsetY,
        'parent',		document.body,
        'position',		'absolute',
        'styleClass',	domTT_styleClass,
        'type',			'greasy',
        'trail',		false,
        'lazy',			false
    );

    // load in the options from the function call
    for (var i = 2; i < arguments.length; i += 2)
    {
        // load in predefined
        if (arguments[i] == 'predefined')
        {
            var predefinedOptions = domTT_predefined.get(arguments[i + 1]);
            for (var j in predefinedOptions.elementData)
            {
                options.set(j, predefinedOptions.get(j));
            }
        }
        // set option
        else
        {
            options.set(arguments[i], arguments[i + 1]);
        }
    }

    options.set('eventType', in_event != null ? in_event.type : null);

    // immediately set the status text if provided
    if (options.has('statusText'))
    {
        try { window.status = options.get('statusText'); } catch(e) {}
    }

    // if we didn't give content...assume we just wanted to change the status and return
    if (!options.has('content') || options.get('content') == '' || options.get('content') == null)
    {
        if (typeof(owner.onmouseout) != 'function')
        {
            owner.onmouseout = function(in_event) { domTT_mouseout(this, in_event); };
        }

        return owner.id;
    }

    options.set('owner', owner);

    domTT_create(options);

    // determine the show delay
    options.set('delay', (in_event != null && in_event.type.match(/click|mousedown|contextmenu/i)) ? 0 : parseInt(options.get('delay')));
    domTT_tooltips.set(owner.id, options);
    domTT_tooltips.set(options.get('id'), options);
    options.set('status', 'pending');
    options.set('activateTimeout', domLib_setTimeout(domTT_runShow, options.get('delay'), [owner.id, in_event]));

    return owner.id;
}

// }}}
// {{{ domTT_create()

function domTT_create(in_options)
{
    var tipOwner = in_options.get('owner');
    var parentObj = in_options.get('parent');
    var parentDoc = parentObj.ownerDocument || parentObj.document;

    // create the tooltip and hide it
    // NOTE: two steps to avoid "flashing" in gecko
    var embryo = parentDoc.createElement('div');
    var tipObj = parentObj.appendChild(embryo);
    tipObj.style.position = 'absolute';
    tipObj.style.left = '0px';
    tipObj.style.top = '0px';
    tipObj.style.visibility = 'hidden';
    tipObj.id = in_options.get('id');
    tipObj.className = in_options.get('styleClass');

    var contentBlock;
    var tableLayout = false;

    if (in_options.get('caption') || (in_options.get('type') == 'sticky' && in_options.get('caption') !== false))
    {
        tableLayout = true;
        // layout the tip with a hidden formatting table
        var tipLayoutTable = tipObj.appendChild(parentDoc.createElement('table'));
        tipLayoutTable.style.borderCollapse = 'collapse';
        if (domLib_isKHTML)
        {
            tipLayoutTable.cellSpacing = 0;
        }

        var tipLayoutTbody = tipLayoutTable.appendChild(parentDoc.createElement('tbody'));

        var numCaptionCells = 0;
        var captionRow = tipLayoutTbody.appendChild(parentDoc.createElement('tr'));
        var captionCell = captionRow.appendChild(parentDoc.createElement('td'));
        captionCell.style.padding = '0px';
        var caption = captionCell.appendChild(parentDoc.createElement('div'));
        caption.className = 'caption';
        if (domLib_isIE50)
        {
            caption.style.height = '100%';
        }

        if (in_options.get('caption').nodeType)
        {
            caption.appendChild(domTT_cloneNodes ? in_options.get('caption').cloneNode(1) : in_options.get('caption'));
        }
        else
        {
            caption.innerHTML = in_options.get('caption');
        }

        if (in_options.get('type') == 'sticky')
        {
            var numCaptionCells = 2;
            var closeLinkCell = captionRow.appendChild(parentDoc.createElement('td'));
            closeLinkCell.style.padding = '0px';
            var closeLink = closeLinkCell.appendChild(parentDoc.createElement('div'));
            closeLink.className = 'caption';
            if (domLib_isIE50)
            {
                closeLink.style.height = '100%';
            }

            closeLink.style.textAlign = 'right';
            closeLink.style.cursor = domLib_stylePointer;
            // merge the styles of the two cells
            closeLink.style.borderLeftWidth = caption.style.borderRightWidth = '0px';
            closeLink.style.paddingLeft = caption.style.paddingRight = '0px';
            closeLink.style.marginLeft = caption.style.marginRight = '0px';
            if (in_options.get('closeLink').nodeType)
            {
                closeLink.appendChild(in_options.get('closeLink').cloneNode(1));
            }
            else
            {
                closeLink.innerHTML = in_options.get('closeLink');
            }

            closeLink.onclick = function()
            {
                domTT_deactivate(tipOwner.id);
            };
            closeLink.onmousedown = function(in_event)
            {
                if (typeof(in_event) == 'undefined') { in_event = window.event; }
                in_event.cancelBubble = true;
            };
            // MacIE has to have a newline at the end and must be made with createTextNode()
            if (domLib_isMacIE)
            {
                closeLinkCell.appendChild(parentDoc.createTextNode("\n"));
            }
        }

        // MacIE has to have a newline at the end and must be made with createTextNode()
        if (domLib_isMacIE)
        {
            captionCell.appendChild(parentDoc.createTextNode("\n"));
        }

        var contentRow = tipLayoutTbody.appendChild(parentDoc.createElement('tr'));
        var contentCell = contentRow.appendChild(parentDoc.createElement('td'));
        contentCell.style.padding = '0px';
        if (numCaptionCells)
        {
            if (domLib_isIE || domLib_isOpera)
            {
                contentCell.colSpan = numCaptionCells;
            }
            else
            {
                contentCell.setAttribute('colspan', numCaptionCells);
            }
        }

        contentBlock = contentCell.appendChild(parentDoc.createElement('div'));
        if (domLib_isIE50)
        {
            contentBlock.style.height = '100%';
        }
    }
    else
    {
        contentBlock = tipObj.appendChild(parentDoc.createElement('div'));
    }

    contentBlock.className = 'contents';

    var content = in_options.get('content');
    // allow content has a function to return the actual content
    if (typeof(content) == 'function') {
        content = content(in_options.get('id'));
    }

    if (content != null && content.nodeType)
    {
        contentBlock.appendChild(domTT_cloneNodes ? content.cloneNode(1) : content);
    }
    else
    {
        contentBlock.innerHTML = content;
    }

    // adjust the width if specified
    if (in_options.has('width'))
    {
        tipObj.style.width = parseInt(in_options.get('width')) + 'px';
    }

    // check if we are overridding the maxWidth
    // if the browser supports maxWidth, the global setting will be ignored (assume stylesheet)
    var maxWidth = domTT_maxWidth;
    if (in_options.has('maxWidth'))
    {
        if ((maxWidth = in_options.get('maxWidth')) === false)
        {
            tipObj.style.maxWidth = domLib_styleNoMaxWidth;
        }
        else
        {
            maxWidth = parseInt(in_options.get('maxWidth'));
            tipObj.style.maxWidth = maxWidth + 'px';
        }
    }

    // HACK: fix lack of maxWidth in CSS for KHTML and IE
    if (maxWidth !== false && (domLib_isIE || domLib_isKHTML) && tipObj.offsetWidth > maxWidth)
    {
        tipObj.style.width = maxWidth + 'px';
    }

    in_options.set('offsetWidth', tipObj.offsetWidth);
    in_options.set('offsetHeight', tipObj.offsetHeight);

    // konqueror miscalcuates the width of the containing div when using the layout table based on the
    // border size of the containing div
    if (domLib_isKonq && tableLayout && !tipObj.style.width)
    {
        var left = document.defaultView.getComputedStyle(tipObj, '').getPropertyValue('border-left-width');
        var right = document.defaultView.getComputedStyle(tipObj, '').getPropertyValue('border-right-width');

        left = left.substring(left.indexOf(':') + 2, left.indexOf(';'));
        right = right.substring(right.indexOf(':') + 2, right.indexOf(';'));
        var correction = 2 * ((left ? parseInt(left) : 0) + (right ? parseInt(right) : 0));
        tipObj.style.width = (tipObj.offsetWidth - correction) + 'px';
    }

    // if a width is not set on an absolutely positioned object, both IE and Opera
    // will attempt to wrap when it spills outside of body...we cannot have that
    if (domLib_isIE || domLib_isOpera)
    {
        if (!tipObj.style.width)
        {
            // HACK: the correction here is for a border
            tipObj.style.width = (tipObj.offsetWidth - 2) + 'px';
        }

        // HACK: the correction here is for a border
        tipObj.style.height = (tipObj.offsetHeight - 2) + 'px';
    }

    // store placement offsets from event position
    var offsetX, offsetY;

    // tooltip floats
    if (in_options.get('position') == 'absolute' && !(in_options.has('x') && in_options.has('y')))
    {
        // determine the offset relative to the pointer
        switch (in_options.get('direction'))
        {
            case 'northeast':
                offsetX = in_options.get('offsetX');
                offsetY = 0 - tipObj.offsetHeight - in_options.get('offsetY');
                break;
            case 'northwest':
                offsetX = 0 - tipObj.offsetWidth - in_options.get('offsetX');
                offsetY = 0 - tipObj.offsetHeight - in_options.get('offsetY');
                break;
            case 'north':
                offsetX = 0 - parseInt(tipObj.offsetWidth/2);
                offsetY = 0 - tipObj.offsetHeight - in_options.get('offsetY');
                break;
            case 'southwest':
                offsetX = 0 - tipObj.offsetWidth - in_options.get('offsetX');
                offsetY = in_options.get('offsetY');
                break;
            case 'southeast':
                offsetX = in_options.get('offsetX');
                offsetY = in_options.get('offsetY');
                break;
            case 'south':
                offsetX = 0 - parseInt(tipObj.offsetWidth/2);
                offsetY = in_options.get('offsetY');
                break;
        }

        // if we are in an iframe, get the offsets of the iframe in the parent document
        if (in_options.get('inframe'))
        {
            var iframeObj = domLib_getIFrameReference(window);
            if (iframeObj)
            {
                var frameOffsets = domLib_getOffsets(iframeObj);
                offsetX += frameOffsets.get('left');
                offsetY += frameOffsets.get('top');
            }
        }
    }
    // tooltip is fixed
    else
    {
        offsetX = 0;
        offsetY = 0;
        in_options.set('trail', false);
    }

    // set the direction-specific offsetX/Y
    in_options.set('offsetX', offsetX);
    in_options.set('offsetY', offsetY);
    if (in_options.get('clearMouse') && in_options.get('direction').indexOf('south') != -1)
    {
        in_options.set('mouseOffset', domTT_mouseHeight);
    }
    else
    {
        in_options.set('mouseOffset', 0);
    }

    if (domLib_canFade && typeof(Fadomatic) == 'function')
    {
        if (in_options.get('fade') != 'neither')
        {
            var fadeHandler = new Fadomatic(tipObj, 10, 0, 0, in_options.get('fadeMax'));
            in_options.set('fadeHandler', fadeHandler);
        }
    }
    else
    {
        in_options.set('fade', 'neither');
    }

    // setup mouse events
    if (in_options.get('trail') && typeof(tipOwner.onmousemove) != 'function')
    {
        tipOwner.onmousemove = function(in_event) { domTT_mousemove(this, in_event); };
    }

    if (typeof(tipOwner.onmouseout) != 'function')
    {
        tipOwner.onmouseout = function(in_event) { domTT_mouseout(this, in_event); };
    }

    if (in_options.get('type') == 'sticky')
    {
        if (in_options.get('position') == 'absolute' && domTT_dragEnabled && in_options.get('draggable'))
        {
            if (domLib_isIE)
            {
                captionRow.onselectstart = function() { return false; };
            }

            // setup drag
            captionRow.onmousedown = function(in_event) { domTT_dragStart(tipObj, in_event);  };
            captionRow.onmousemove = function(in_event) { domTT_dragUpdate(in_event); };
            captionRow.onmouseup = function() { domTT_dragStop(); };
        }
    }
    else if (in_options.get('type') == 'velcro')
    {
        /* can use once we have deactivateDelay
		tipObj.onmouseover = function(in_event)
		{
			if (typeof(in_event) == 'undefined') { in_event = window.event; }
			var tooltip = domTT_tooltips.get(tipObj.id);
			if (in_options.get('lifetime')) {
				domLib_clearTimeout(in_options.get('lifetimeTimeout');
			}
		};
		*/
        tipObj.onmouseout = function(in_event)
        {
            if (typeof(in_event) == 'undefined') { in_event = window.event; }
            if (!domLib_isDescendantOf(in_event[domLib_eventTo], tipObj, domTT_bannedTags)) {
                domTT_deactivate(tipOwner.id);
            }
        };
        // NOTE: this might interfere with links in the tip
        tipObj.ondblclick = function(in_event)
        {
            domTT_deactivate(tipOwner.id);
        };
    }

    if (in_options.get('position') == 'relative')
    {
        tipObj.style.position = 'relative';
    }

    in_options.set('node', tipObj);
    in_options.set('status', 'inactive');
}

// }}}
// {{{ domTT_show()

// in_id is either tip id or the owner id
function domTT_show(in_id, in_event)
{

    // should always find one since this call would be cancelled if tip was killed
    var tooltip = domTT_tooltips.get(in_id);
    var status = tooltip.get('status');
    var tipObj = tooltip.get('node');

    if (tooltip.get('position') == 'absolute')
    {
        var mouseX, mouseY;

        if (tooltip.has('x') && tooltip.has('y'))
        {
            mouseX = tooltip.get('x');
            mouseY = tooltip.get('y');
        }
        else if (!domTT_useGlobalMousePosition || domTT_mousePosition == null || status == 'active' || tooltip.get('delay') == 0)
        {
            var eventPosition = domLib_getEventPosition(in_event);
            var eventX = eventPosition.get('x');
            var eventY = eventPosition.get('y');
            if (tooltip.get('inframe'))
            {
                eventX -= eventPosition.get('scrollX');
                eventY -= eventPosition.get('scrollY');
            }

            // only move tip along requested trail axis when updating position
            if (status == 'active' && tooltip.get('trail') !== true)
            {
                var trail = tooltip.get('trail');
                if (trail == 'x')
                {
                    mouseX = eventX;
                    mouseY = tooltip.get('mouseY');
                }
                else if (trail == 'y')
                {
                    mouseX = tooltip.get('mouseX');
                    mouseY = eventY;
                }
            }
            else
            {
                mouseX = eventX;
                mouseY = eventY;
            }
        }
        else
        {
            mouseX = domTT_mousePosition.get('x');
            mouseY = domTT_mousePosition.get('y');
            if (tooltip.get('inframe'))
            {
                mouseX -= domTT_mousePosition.get('scrollX');
                mouseY -= domTT_mousePosition.get('scrollY');
            }
        }

        // we are using a grid for updates
        if (tooltip.get('grid'))
        {
            // if this is not a mousemove event or it is a mousemove event on an active tip and
            // the movement is bigger than the grid
            if (in_event.type != 'mousemove' || (status == 'active' && (Math.abs(tooltip.get('lastX') - mouseX) > tooltip.get('grid') || Math.abs(tooltip.get('lastY') - mouseY) > tooltip.get('grid'))))
            {
                tooltip.set('lastX', mouseX);
                tooltip.set('lastY', mouseY);
            }
            // did not satisfy the grid movement requirement
            else
            {
                return false;
            }
        }

        // mouseX and mouseY store the last acknowleged mouse position,
        // good for trailing on one axis
        tooltip.set('mouseX', mouseX);
        tooltip.set('mouseY', mouseY);

        var coordinates;
        if (domTT_screenEdgeDetection)
        {
            coordinates = domTT_correctEdgeBleed(
                tooltip.get('offsetWidth'),
                tooltip.get('offsetHeight'),
                mouseX,
                mouseY,
                tooltip.get('offsetX'),
                tooltip.get('offsetY'),
                tooltip.get('mouseOffset'),
                tooltip.get('inframe') ? window.parent : window
            );
        }
        else
        {
            coordinates = {
                'x' : mouseX + tooltip.get('offsetX'),
                'y' : mouseY + tooltip.get('offsetY') + tooltip.get('mouseOffset')
            };
        }

        // update the position
        tipObj.style.left = coordinates.x + 'px';
        tipObj.style.top = coordinates.y + 'px';

        // increase the tip zIndex so it goes over previously shown tips
        tipObj.style.zIndex = domLib_zIndex++;
    }

    // if tip is not active, active it now and check for a fade in
    if (status == 'pending')
    {
        // unhide the tooltip
        tooltip.set('status', 'active');
        tipObj.style.display = '';
        tipObj.style.visibility = 'visible';

        var fade = tooltip.get('fade');
        if (fade != 'neither')
        {
            var fadeHandler = tooltip.get('fadeHandler');
            if (fade == 'out' || fade == 'both')
            {
                fadeHandler.haltFade();
                if (fade == 'out')
                {
                    fadeHandler.halt();
                }
            }

            if (fade == 'in' || fade == 'both')
            {
                fadeHandler.fadeIn();
            }
        }

        if (tooltip.get('type') == 'greasy' && tooltip.get('lifetime') != 0)
        {
            tooltip.set('lifetimeTimeout', domLib_setTimeout(domTT_runDeactivate, tooltip.get('lifetime'), [tipObj.id]));
        }
    }

    if (tooltip.get('position') == 'absolute' && domTT_detectCollisions)
    {
        // utilize original collision element cache
        domLib_detectCollisions(tipObj, false, true);
    }
}

// }}}
// {{{ domTT_close()

// in_handle can either be an child object of the tip, the tip id or the owner id
function domTT_close(in_handle)
{
    var id;
    if (typeof(in_handle) == 'object' && in_handle.nodeType)
    {
        var obj = in_handle;
        while (!obj.id || !domTT_tooltips.get(obj.id))
        {
            obj = obj.parentNode;

            if (obj.nodeType != document.ELEMENT_NODE) { return; }
        }

        id = obj.id;
    }
    else
    {
        id = in_handle;
    }

    domTT_deactivate(id);
}

// }}}
// {{{ domTT_closeAll()

// run through the tooltips and close them all
function domTT_closeAll()
{
    // NOTE: this will iterate 2x # of tooltips
    for (var id in domTT_tooltips.elementData) {
        domTT_close(id);
    }
}

// }}}
// {{{ domTT_deactivate()

// in_id is either the tip id or the owner id
function domTT_deactivate(in_id)
{
    var tooltip = domTT_tooltips.get(in_id);
    if (tooltip)
    {
        var status = tooltip.get('status');
        if (status == 'pending')
        {
            // cancel the creation of this tip if it is still pending
            domLib_clearTimeout(tooltip.get('activateTimeout'));
            tooltip.set('status', 'inactive');
        }
        else if (status == 'active')
        {
            if (tooltip.get('lifetime'))
            {
                domLib_clearTimeout(tooltip.get('lifetimeTimeout'));
            }

            var tipObj = tooltip.get('node');
            if (tooltip.get('closeAction') == 'hide')
            {
                var fade = tooltip.get('fade');
                if (fade != 'neither')
                {
                    var fadeHandler = tooltip.get('fadeHandler');
                    if (fade == 'out' || fade == 'both')
                    {
                        fadeHandler.fadeOut();
                    }
                    else
                    {
                        fadeHandler.hide();
                    }
                }
                else
                {
                    tipObj.style.display = 'none';
                }
            }
            else
            {
                tooltip.get('parent').removeChild(tipObj);
                domTT_tooltips.remove(tooltip.get('owner').id);
                domTT_tooltips.remove(tooltip.get('id'));
            }

            tooltip.set('status', 'inactive');
            if (domTT_detectCollisions) {
                // unhide all of the selects that are owned by this object
                // utilize original collision element cache
                domLib_detectCollisions(tipObj, true, true);
            }
        }
    }
}

// }}}
// {{{ domTT_mouseout()

function domTT_mouseout(in_owner, in_event)
{
    if (!domLib_useLibrary) { return false; }

    if (typeof(in_event) == 'undefined') { in_event = window.event;	}

    var toChild = domLib_isDescendantOf(in_event[domLib_eventTo], in_owner, domTT_bannedTags);
    var tooltip = domTT_tooltips.get(in_owner.id);
    if (tooltip && (tooltip.get('type') == 'greasy' || tooltip.get('status') != 'active'))
    {
        // deactivate tip if exists and we moved away from the owner
        if (!toChild)
        {
            domTT_deactivate(in_owner.id);
            try { window.status = window.defaultStatus; } catch(e) {}
        }
    }
    else if (!toChild)
    {
        try { window.status = window.defaultStatus; } catch(e) {}
    }
}

// }}}
// {{{ domTT_mousemove()

function domTT_mousemove(in_owner, in_event)
{
    if (!domLib_useLibrary) { return false; }

    if (typeof(in_event) == 'undefined') { in_event = window.event;	}

    var tooltip = domTT_tooltips.get(in_owner.id);
    if (tooltip && tooltip.get('trail') && tooltip.get('status') == 'active')
    {
        // see if we are trailing lazy
        if (tooltip.get('lazy'))
        {
            domLib_setTimeout(domTT_runShow, domTT_trailDelay, [in_owner.id, in_event]);
        }
        else
        {
            domTT_show(in_owner.id, in_event);
        }
    }
}

// }}}
// {{{ domTT_addPredefined()

function domTT_addPredefined(in_id)
{
    var options = new Hash();
    for (var i = 1; i < arguments.length; i += 2)
    {
        options.set(arguments[i], arguments[i + 1]);
    }

    domTT_predefined.set(in_id, options);
}

// }}}
// {{{ domTT_correctEdgeBleed()

function domTT_correctEdgeBleed(in_width, in_height, in_x, in_y, in_offsetX, in_offsetY, in_mouseOffset, in_window)
{
    var win, doc;
    var bleedRight, bleedBottom;
    var pageHeight, pageWidth, pageYOffset, pageXOffset;

    var x = in_x + in_offsetX;
    var y = in_y + in_offsetY + in_mouseOffset;

    win = (typeof(in_window) == 'undefined' ? window : in_window);

    // Gecko and IE swaps values of clientHeight, clientWidth properties when
    // in standards compliance mode from documentElement to document.body
    doc = ((domLib_standardsMode && (domLib_isIE || domLib_isGecko)) ? win.document.documentElement : win.document.body);

    // for IE in compliance mode
    if (domLib_isIE)
    {
        pageHeight = doc.clientHeight;
        pageWidth = doc.clientWidth;
        pageYOffset = doc.scrollTop;
        pageXOffset = doc.scrollLeft;
    }
    else
    {
        pageHeight = doc.clientHeight;
        pageWidth = doc.clientWidth;

        if (domLib_isKHTML)
        {
            pageHeight = win.innerHeight;
        }

        pageYOffset = win.pageYOffset;
        pageXOffset = win.pageXOffset;
    }

    // we are bleeding off the right, move tip over to stay on page
    // logic: take x position, add width and subtract from effective page width
    if ((bleedRight = (x - pageXOffset) + in_width - (pageWidth - domTT_screenEdgePadding)) > 0)
    {
        x -= bleedRight;
    }

    // we are bleeding to the left, move tip over to stay on page
    // if tip doesn't fit, we will go back to bleeding off the right
    // logic: take x position and check if less than edge padding
    if ((x - pageXOffset) < domTT_screenEdgePadding)
    {
        x = domTT_screenEdgePadding + pageXOffset;
    }

    // if we are bleeding off the bottom, flip to north
    // logic: take y position, add height and subtract from effective page height
    if ((bleedBottom = (y - pageYOffset) + in_height - (pageHeight - domTT_screenEdgePadding)) > 0)
    {
        y = in_y - in_height - in_offsetY;
    }

    // if we are bleeding off the top, flip to south
    // if tip doesn't fit, we will go back to bleeding off the bottom
    // logic: take y position and check if less than edge padding
    if ((y - pageYOffset) < domTT_screenEdgePadding)
    {
        y = in_y + domTT_mouseHeight + in_offsetY;
    }

    return {'x' : x, 'y' : y};
}

// }}}
// {{{ domTT_isActive()

// in_id is either the tip id or the owner id
function domTT_isActive(in_id)
{
    var tooltip = domTT_tooltips.get(in_id);
    if (!tooltip || tooltip.get('status') != 'active')
    {
        return false;
    }
    else
    {
        return true;
    }
}

// }}}
// {{{ domTT_runXXX()

// All of these domMenu_runXXX() methods are used by the event handling sections to
// avoid the circular memory leaks caused by inner functions
function domTT_runDeactivate(args) { domTT_deactivate(args[0]); }
function domTT_runShow(args) { domTT_show(args[0], args[1]); }

// }}}
// {{{ domTT_replaceTitles()

function domTT_replaceTitles(in_decorator)
{
    var elements = domLib_getElementsByClass('tooltip');
    for (var i = 0; i < elements.length; i++)
    {
        if (elements[i].title)
        {
            var content;
            if (typeof(in_decorator) == 'function')
            {
                content = in_decorator(elements[i]);
            }
            else
            {
                content = elements[i].title;
            }

            content = content.replace(new RegExp('\'', 'g'), '\\\'');
            elements[i].onmouseover = new Function('in_event', "domTT_activate(this, in_event, 'content', '" + content + "')");
            elements[i].title = '';
        }
    }
}

// }}}
// {{{ domTT_update()

// Allow authors to update the contents of existing tips using the DOM
// Unfortunately, the tip must already exist, or else no work is done.
// TODO: make getting at content or caption cleaner
function domTT_update(handle, content, type)
{
    // type defaults to 'content', can also be 'caption'
    if (typeof(type) == 'undefined')
    {
        type = 'content';
    }

    var tip = domTT_tooltips.get(handle);
    if (!tip)
    {
        return;
    }

    var tipObj = tip.get('node');
    var updateNode;
    if (type == 'content')
    {
        // <div class="contents">...
        updateNode = tipObj.firstChild;
        if (updateNode.className != 'contents')
        {
            // <table><tbody><tr>...</tr><tr><td><div class="contents">...
            updateNode = updateNode.firstChild.firstChild.nextSibling.firstChild.firstChild;
        }
    }
    else
    {
        updateNode = tipObj.firstChild;
        if (updateNode.className == 'contents')
        {
            // missing caption
            return;
        }

        // <table><tbody><tr><td><div class="caption">...
        updateNode = updateNode.firstChild.firstChild.firstChild.firstChild;
    }

    // TODO: allow for a DOM node as content
    updateNode.innerHTML = content;
}

// }}}
GM_addStyle(`
/* Default DOM Tooltip Style */
div.domTT {
border: 1px solid #333333;
background-color: #333333;
max-height: 60%;
overflow: auto;
}
div.domTT .caption {
font-family: serif;
font-size: 12px;
font-weight: bold;
padding: 1px 2px;
color: #FFFFFF;
}
div.domTT .contents {
font-size: 12px;
font-family: sans-serif;
padding: 3px 2px;
background-color: #F1F1FF;
word-break: break-all;
word-wrap: break-word;
white-space: pre-line;
}

/* Classic Style */
div.domTTClassic {
border: 1px solid black;
background-color: InfoBackground;
}
div.domTTClassic .caption {
font-family: serif;
font-size: 13px;
_font-size: 12px;
font-weight: bold;
font-style: italic;
padding: 1px 2px;
}
div.domTTClassic .contents {
color: InfoText;
font-size: 13px;
_font-size: 12px;
font-family: Arial, sans-serif;
padding: 1px 2px;
_padding-bottom: 0;
}

/* Win9x Style */
div.domTTWin {
border: 2px outset #BFBFBF;
background-color: #808080
}
div.domTTWin .caption {
border: 0px solid #BFBFBF;
border-width: 1px 1px 0px 1px;
background-color: #00007F;
padding: 2px;
font-size: 12px;
font-weight: bold;
font-family: sans-serif;
color: white;
}
div.domTTWin .contents {
border: 1px solid #BFBFBF;
}

/* Overlib Style */
div.domTTOverlib {
border: 1px solid #333366;
background-color: #333366;
}
div.domTTOverlib .caption {
font-family: Verdana, Helvetica;
font-size: 10px;
font-weight: bold;
color: #FFFFFF;
}
div.domTTOverlib .contents {
font-size: 10px;
font-family: Verdana, Helvetica;
padding: 2px;
background-color: #F1F1FF;
}

/* Nicetitle Style */
div.niceTitle
{
background-color: #333333;
color: #FFFFFF;
font-weight: bold;
font-size: 13px;
font-family: "Trebuchet MS", sans-serif;
width: 250px;
left: 0;
top: 0;
padding: 4px;
position: absolute;
text-align: left;
z-index: 20;
-moz-border-radius: 0 10px 10px 10px;
filter: progid:DXImageTransform.Microsoft.Alpha(opacity=87);
-moz-opacity: .87;
-khtml-opacity: .87;
opacity: .87;
}
div.niceTitle .contents
{
margin: 0;
padding: 0 3px;
filter: progid:DXImageTransform.Microsoft.Alpha(opacity=100);
-moz-opacity: 1;
-khtml-opacity: 1;
opacity: 1;
}
div.niceTitle p
{
color: #D17E62;
font-size: 9px;
padding: 3px 0 0 0;
margin: 0;
text-align: left;
-moz-opacity: 1;
}

/* Context Menu Style */
div.domTTMenu {
width: 150px;
border: 2px outset #E6E6E6;
}
div.domTTMenu .caption {
font-size: 12px;
font-family: sans-serif;
background-color: #E6E6E6;
}
div.domTTMenu .contents {
padding: 1px 0;
background-color: #E6E6E6;
}

div.domTT .contents img {
max-width: 100%;
}

.emotac01, .emotac02, .emotac03, .emotac04, .emotac05, 
.emotac06, .emotac07, .emotac08, .emotac09, .emotac10, 
.emotac1003, .emotac11, .emotac12, .emotac13, .emotac14, 
.emotac15, .emotac16, .emotac17, .emotac18, .emotac19, 
.emotac20, .emotac22, .emotac23, .emotac24, .emotac25, 
.emotac26, .emotac32, .emotac39, .emotac43, .emotac52
{ max-width: 100%; background-size: 100%; background-image: url('https://file.cc98.org/v2-upload/43yyjnlr.png'); }
 
.emotac01 { background-position: 0 0%; background-size: 100%; }
.emotac02 { background-position: 0 3.448276%; background-size: 100%; }
.emotac03 { background-position: 0 6.896552%; background-size: 100%; }
.emotac04 { background-position: 0 10.344828%; background-size: 100%; }
.emotac05 { background-position: 0 13.793103%; background-size: 100%; }
.emotac06 { background-position: 0 17.241379%; background-size: 100%; }
.emotac07 { background-position: 0 20.689655%; background-size: 100%; }
.emotac08 { background-position: 0 24.137931%; background-size: 100%; }
.emotac09 { background-position: 0 27.586207%; background-size: 100%; }
.emotac10 { background-position: 0 31.034483%; background-size: 100%; }
.emotac1003 { background-position: 0 34.482759%; background-size: 100%; }
.emotac11 { background-position: 0 37.931034%; background-size: 100%; }
.emotac12 { background-position: 0 41.37931%; background-size: 100%; }
.emotac13 { background-position: 0 44.827586%; background-size: 100%; }
.emotac14 { background-position: 0 48.275862%; background-size: 100%; }
.emotac15 { background-position: 0 51.724138%; background-size: 100%; }
.emotac16 { background-position: 0 55.172414%; background-size: 100%; }
.emotac17 { background-position: 0 58.62069%; background-size: 100%; }
.emotac18 { background-position: 0 62.068966%; background-size: 100%; }
.emotac19 { background-position: 0 65.517241%; background-size: 100%; }
.emotac20 { background-position: 0 68.965517%; background-size: 100%; }
.emotac22 { background-position: 0 72.413793%; background-size: 100%; }
.emotac23 { background-position: 0 75.862069%; background-size: 100%; }
.emotac24 { background-position: 0 79.310345%; background-size: 100%; }
.emotac25 { background-position: 0 82.758621%; background-size: 100%; }
.emotac26 { background-position: 0 86.206897%; background-size: 100%; }
.emotac32 { background-position: 0 89.655172%; background-size: 100%; }
.emotac39 { background-position: 0 93.103448%; background-size: 100%; }
.emotac43 { background-position: 0 96.551724%; background-size: 100%; }
.emotac52 { background-position: 0 100%; background-size: 100%; }
`);
var cache_content = {};
var oldlength = {};
var oldurl = {};
function handletarget(target){
    var focustopictitle = $(target);
    if (focustopictitle.length == oldlength[target] && document.location.href == oldurl[target]){return;}
    $("[id^='__autoId']").each(function(){$(this).removeAttr("id");})
    oldlength[target] = focustopictitle.length;
    oldurl[target] = document.location.href;
    //console.log("unbind mouseover "+target);
    focustopictitle.unbind('mouseover');
    focustopictitle.mouseover(
        function(event){
            var thisx = this;
            var title=$(this).text();
            var topicid;
            if(target==".focus-topic-title"||target=='a[href^="/topic/"]'){
                var href=$(this).attr('href');
                topicid = href.split("/")[2];
            }else if(target==".listTitle"){
                topicid = $(this).attr('id').replace("title","");
            }else{
                return;
            }
            var content;
            var width=400;
            if(window.innerWidth<420) width = window.innerWidth-20;
            if(window.innerWidth>1000) width=700;
            if(typeof(cache_content[topicid])!='undefined'){
                content = cache_content[topicid];
                domTT_activate(thisx, event, 'content', content, 'trail', false, 'direction', 'southeast', 'clearMouse', true, 'delay', 0, 'maxWidth', width, 'caption', title, 'type', 'velcro', 'draggable', false);
            }else{
                console.log("request "+topicid);
                GM_xmlhttpRequest({method:"GET", url:"https://cc98.tech/topic/"+topicid+"/onmouseover",responseType:"json",onload: function (response) {
                    content=JSON.parse(response.responseText).html;
                    cache_content[topicid] = content;
                    domTT_activate(thisx, event, 'content', content, 'trail', false, 'direction', 'southeast', 'clearMouse', true, 'delay', 0, 'maxWidth', width, 'caption', title, 'type', 'velcro', 'draggable', false);
                }});
            }

        }
    );
}
setInterval(function(){
    handletarget(".focus-topic-title");
    handletarget(".listTitle");
    if(/message/.test(document.location.href)) handletarget('a[href^="/topic/"]');
},2000);
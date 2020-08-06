// ==UserScript==
// @name         HappyChat SSR
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Hide the SSR in a popup window
// @author       You
// @match        https://hud.happychat.io/*
// @require      https://code.jquery.com/jquery-1.12.4.js
// @grant        none
// ==/UserScript==

var $ = window.jQuery;

// Attach the ssr toggle button near the "+1" button
const ssrToggleBtnInterval = window.setInterval(() => {
    if (document.getElementsByClassName('chat-list__title-bar')[0]) {
        const ssrToggleBtnHtml = `<button class="ssr-toggle">VIEW SSR</button>`;
        document.getElementsByClassName('chat-list__title-bar')[0]
            .insertAdjacentHTML('afterend', ssrToggleBtnHtml);
        document.getElementsByClassName(`ssr-toggle`)[0]
            .onclick = ssrPopup;
        window.clearInterval(ssrToggleBtnInterval);
    }
}, 150);

// Add the popup
const ssr_popup = `
<div onclick="$(this).hide()" id="ssr-popup">
    <div class="content"></br>No SSR</div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', ssr_popup);

// Toggle the popup and get the system status report
function ssrPopup() {

    let ssr_msg = $(" #ssr ").last().html();
    $(" #ssr-popup .content ").html( ssr_msg )

    //Style the system status report
    $(" #ssr-popup .content ").html(function () {
        return $(this).html().replace(/### WordPress Environment/gi, "<h2 class='section-header'>WordPress Environment")
    });
    $(" #ssr-popup .content ").html(function () {
        return $(this).html().replace(/### /gi, "</p><h2 class='section-header'>")
    });
    $(" #ssr-popup .content ").html(function () {
        return $(this).html().replace(/ ###/gi, "</h2><p class='section-wrapper'>")
    });
    $(" #ssr-popup .content ").html(function () {
        return $(this).html().replace(/`\n/gi, "<div>")
    });
    $(" #ssr-popup .content ").html(function () {
        return $(this).html().replace(/\n`/gi, "</div>")
    });

    $(" #ssr-popup ").show()
}

// Listen for changes in session and label system status messages
function waitingforChat () {

    const sesh = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer");

    if ( sesh != null ) {
        console.log("Loaded")
        let chat = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer"),
            options = {
                childList:true,
                attributes:true
            }
        let observer = new MutationObserver(function(){
            $(' .chat__message__text:contains("### WordPress") ').each( function() {
                if( $(this).attr('id') === undefined ){
                    $(this).attr('id', 'ssr').parent().hide();
                }
            });
        });
        observer.observe(chat, options); } else {
            setTimeout(waitingforChat, 2000);
        }
}

waitingforChat()

// Adding Styles
const styles = `
<style type="text/css">
button.ssr-toggle {
    width: 100%;
    margin: 5px 0;
}
div#ssr-popup {
    display: none;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    max-width: 320px;
    width: 50%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgb(79,116,141,.90);
    color: white;
    font-size: 12px;
    white-space: pre-line;
    padding: 10px;
}
.section-heading {
    position: relative;
    background: #14acdd;
    color: #fff;
    font-weight: bold;
    padding: 1em;
    margin-top: 1em;
    text-decoration: none;
    display: block;
    cursor: pointer;
}

.section-wrapper {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1em;
}

.section-wrap hr {
    border-top: 1px dashed rgba(0, 0, 0, 0.1);
    margin: 0.3em 0;
}

.section_expand:after {
    position: absolute;
    content: "+";
    height: 1em;
    width: 1em;
    top: 13px;
    right: 5px;
    color: #fff;
    display: block;
    font-size: 25px;
    font-weight: normal
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', styles);

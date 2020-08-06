// ==UserScript==
// @name         HappyChat SSR
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hide the SSR in a popup window
// @author       You
// @match        https://hud.happychat.io/chat/*
// @require      https://code.jquery.com/jquery-1.12.4.js
// @grant        none
// ==/UserScript==

var $ = window.jQuery;

// Listen for new messages
function waitingforChat () {

    function ssr_buttons(){

        console.log("Got it!")

        // Create the popup if it doesn't exist, or toggle display
        let popupBox = document.getElementById("ssr-popup");
        if( popupBox === null ) {
            $(" .chat ").prepend( "<div style='display:none;' id='ssr-popup'></div>" );
        }

        // Apply ID to every chat with SSR
        $(' .chat__message__text:contains("### WordPress") ').each( function() {
            if( $(this).attr('id') === undefined ){
                $(this).attr('id', 'ssr').hide();
                $(this).parent(" div ").append("<button id='ssr-msg-button'>SSR</button>")
                $(" #ssr-popup ").text( $(this).text() )
                $(" #ssr-msg-button ").on("click", function(){
                    $(" #ssr-popup ").text( $(this).prev().text() )
                    $(" #ssr-popup ").toggle()
                });
            }
        });
    }

    // Listen for changes in session
    const sesh = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer");

    if ( sesh != null ) {
        console.log("Loaded")
        let chat = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer"),
            options = {
                childList:true,
                attributes:true
            }
        let observer = new MutationObserver(ssr_buttons)

        observer.observe(chat, options); } else {

            setTimeout(waitingforChat, 2000);

        }
}

waitingforChat();

// Adding Styles
const styles = `
<style type="text/css">
button#ssr-msg-button {
    width: 25%;
    margin: auto;
}
div#ssr-popup {
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
</style>
`;

document.head.insertAdjacentHTML('beforeend', styles);

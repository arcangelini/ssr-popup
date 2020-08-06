// ==UserScript==
// @name         HappyChat SSR
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Hide the SSR in a popup window
// @author       You
// @match        https://hud.happychat.io/*
// @require      https://code.jquery.com/jquery-1.12.4.js
// @grant        GM_setClipboard
// ==/UserScript==

var $ = window.jQuery;

// Customize here!!
const options = {
    STYLE: {
        POPUP_BACKGROUND_COLOR: 'rgb(79,116,141,.90)',
        POPUP_TEXT_COLOR: '#fff',
        POPUP_WIDTH: '340px',
        POPUP_FONT_SIZE: '14px'
    },
    KEYBOARD_SHORTCUTS: {
        USE_SHORTCUTS: true,
        OPEN_CLOSE_NOTE_KEY: 69
    }
}

// Listen for URL changes
const pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    waitingforChat();
};

// Attach keyboard shortcut listener
if (options.KEYBOARD_SHORTCUTS.USE_SHORTCUTS) {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.keyCode === options.KEYBOARD_SHORTCUTS.OPEN_CLOSE_NOTE_KEY) {
            e.preventDefault();
            ssrPopup();
        }
    });
}

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
<div id="ssr-popup">
<div class="ssr-tools">
    <button id="ssr-copy">COPY</button><button id="ssr-wide">WIDE</button></div>
    <div class="content"></br>No SSR</div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', ssr_popup);

// Copy system status report
$("#ssr-copy").click(ssrCopy)

function ssrCopy(){
    let ssrText = $(" #ssr ").last().text();
    GM_setClipboard( ssrText )
}

// Copy system status report
$("#ssr-wide").click(ssrWide)

function ssrWide(){
    let max_width = $(" #ssr-popup ").css("max-width")
    if( max_width === options.STYLE.POPUP_WIDTH ) {
        $("#ssr-wide").text("Narrow")
        $(" #ssr-popup ").css("max-width", "80%")
    } else {
        $("#ssr-wide").text("Wide")
        $(" #ssr-popup ").css("max-width", options.STYLE.POPUP_WIDTH)
    }
}

// Toggle the popup and get the system status report
function ssrPopup() {

    if( $(" #ssr-popup ").css("display") === "none" ){
        let ssr_msg = $(" #ssr ").last().html();
        $(" #ssr-popup .content ").html( ssr_msg )

        //Style the system status report
        $(" #ssr-popup .content ").html(function () {
            return $(this).html().replace(/\n### WordPress Environment/gi, "<h2 onclick='$(this).next().toggle()' id='beginning' class='section-header'>WordPress Environment")
        });
        $(" #ssr-popup .content ").html(function () {
            return $(this).html().replace(/### /gi, "<h2 onclick='$(this).next().toggle()' class='section-header'>")
        });
        $(" #ssr-popup .content ").html(function () {
            return $(this).html().replace(/ ###\n/gi, "</h2><p style='display: none;' class='section-wrapper'>")
        });
        $(" #ssr-popup .content ").html(function () {
            return $(this).html().replace(/`/gi, "<div>")
        });
        $(" #ssr-popup .content ").html(function () {
            return $(this).html().replace(/\n`/gi, "</div>")
        });
        $(" .content .chat__message__meta, .content .chat__message__star ").remove();
        $(" #beginning.previoussibling ").remove();

        $(" #ssr-popup ").slideDown("slow")

        // Listen for closing click then remove listener
        document.querySelector(".chat > .chat__chat-panels").addEventListener("click", closeListen)
        function closeListen(){
            $("#ssr-popup").slideUp("slow");
            document.querySelector(".chat > .chat__chat-panels").removeEventListener("click", closeListen)
        };
    } else {
        $("#ssr-popup").slideUp("slow");
    }
}

// Listen for changes in session and label system status messages
function waitingforChat () {
    const sesh = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer");

    if ( sesh != null ) {
        console.log("Loaded")
        $(" #ssr-popup .content ").html( "No SSR" )
        let chat = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer"),
            options = {
                childList:true,
                attributes:true
            }
        let observer = new MutationObserver(function(){
            $(' .chat__message__text:contains("### WordPress") ').each( function() {
                if( $(this).attr('id') === undefined ){
                    $(this).attr('id', 'ssr').parent().hide();

                    // Trigger window resize to fix chat message loading
                    window.dispatchEvent(new Event('resize'));
                }
            });
        });
        observer.observe(chat, options);

    } else {
        setTimeout(waitingforChat, 2000);
    }
}

waitingforChat();

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
    max-width: ${options.STYLE.POPUP_WIDTH};
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: ${options.STYLE.POPUP_BACKGROUND_COLOR};
    color: ${options.STYLE.POPUP_TEXT_COLOR};
    font-size: ${options.STYLE.POPUP_FONT_SIZE};
    white-space: pre-line;
    padding: 10px;
}
h2.section-header {
    max-width: 400px;
    border-radius: 5px;
    text-align: center;
    background: #fff;
    color: rgb(79,116,141,.90);
    padding: 5px;
    text-decoration: none;
    cursor: pointer;
}
p.section-wrapper {
    margin-top: -20px;
    padding-left: 5px;
}
.ssr-tools button {
    display: inline-block;
    width: 50%;
    margin: 0;
    border: solid 1px #fff;
    background-color: transparent;
    color: #fff;
    margin-top: -40px;
}
button#ssr-wide {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
button#ssr-copy {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', styles);

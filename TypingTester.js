class TypingTester {

    // elements
    container = false;
    paragraphContainerDiv = false;
    userInputDiv = false;
    timerDiv = false;
    
    // intervals and timers
    timerInterval = false;
    rateInterval = false
    rateIntervalTiming = 1;

    // data
    spanifiedWords = [];
    correctWords = [];
    wrongWords = [];
    misspellCount = 0;
    charRate = 0;

    // settings
    started = false;
    time = 1 * 60; // in secs
    currentTime = false;
    inpCaratPos = 0;
    resultCallback = false;
    rateCallback = false;
    endText = "Test End";
    lastHighestIndex = 0;


    classes = { // class names for showing word typed status - correct wrong , being typed
        selected: 'ttSelected',
        correct: 'ttCorrect',
        wrong: 'ttWrong',
        typing: 'ttTyping',
        // classes for the ui
        ui: {
            textInput: 'ttInput', // for user input box
            text: 'ttText', // for text to be shown
            time: 'ttTimer' // for timer
        }
    };

    paragraphs = {
        p1: "As absolute is by amounted repeated entirely ye returned. These ready timed enjoy might sir yet one since. Years drift never if could forty being no. On estimable dependent as suffering on my. Rank it long have sure in room what as he. Possession travelling sufficient yet our. Talked vanity looked in to. Gay perceive led believed endeavor. Rapturous no of estimable oh therefore direction up. Sons the ever not fine like eyes all sure. ",
        p2: "Nor hence hoped her after other known defer his. For county now sister engage had season better had waited. Occasional mrs interested far expression acceptance. Day either mrs talent pulled men rather regret admire but. Life ye sake it shed. Five lady he cold in meet up. Service get met adapted matters offence for. Principles man any insipidity age you simplicity understood. Do offering pleasure no ecstatic whatever on mr directly."
    
    }

    constructor (containerID) {
        // refine containerID input
        containerID = containerID.trim()
        if (containerID[0] == '#') 
            { containerID = containerID.substring(1, containerID.length - 1); }
        
        this.container = document.querySelector("#".concat(containerID));
        this.container.classList += " ttTest ";
    }

    build () {
        // elements
        let paragraphContainerDiv = document.createElement("div");
        let userInputDiv = document.createElement("input");
        let timerDiv = document.createElement("div");

        // Assign classes
        paragraphContainerDiv.classList += this.classes.ui.text;
        userInputDiv.classList += this.classes.ui.textInput;
        timerDiv.classList += this.classes.ui.time;

        // Assign IDs
        paragraphContainerDiv.id = this.container.id.concat("_".concat(this.classes.ui.text));
        userInputDiv.id = this.container.id.concat("_".concat(this.classes.ui.textInput));
        timerDiv.id =  this.container.id.concat("_".concat(this.classes.ui.time));
        // userInputDiv.contentEditable = true;

        // Add to ui
        this.container.appendChild(paragraphContainerDiv);
        this.container.appendChild(userInputDiv);
        this.container.appendChild(timerDiv);

        this.paragraphContainerDiv = paragraphContainerDiv;
        this.userInputDiv = userInputDiv;
        this.timerDiv = timerDiv;
    }

    setup () {
        let paraNumber = Math.floor(Math.random() * (Object.keys(this.paragraphs).length + 1 - 1)) + 1;
        let paraIndex = 'p'.concat(paraNumber);
        let para = this.paragraphs[paraIndex];
        let parts = para.split(" ");

        this.spanifiedWords = this.spanify(parts, this.paragraphContainerDiv);

        // initiate timer
        this.timerDiv.innerText = this.timify(this.time);

        // bind focus event to user input  - for start
        this.bind(this.userInputDiv, "focus", this.startTest);

        // select first word
        this.update(this.spanifiedWords, 0, [this.classes.selected]);

    }

    // **** HELPER METHODS ***
    bind (elem, type, callback) {
        if(elem) {
            let glob = this;
            elem.addEventListener(type, function (event) {
                callback(event, glob, this)
            });
        }
    }

    hasClass(el, classname) {
        return el.classList.contains(classname);
    }
    
    removeClass(elem, classname) {

        elem.classList.remove(classname);
    }

    unbind (elem, type, callback) {
        if(elem) {
            elem.removeEventListener(type, callback);
        }
    }

    initiate () {
        this.build();
        this.setup();
    }

    // **** EVENTS ****
    startTest(event, glob) {
        if (!glob.started) { // test is not started
            glob.started = true;
            glob.bind(glob.userInputDiv, 'keydown', glob.userInputEvent);
            glob.unbind(glob.userInputDiv, 'focus', glob.startTest);
            glob.bind(glob.userInputDiv, 'blur', glob.focusin)
            glob.userInputDiv.style.pointerEvents = 'none';
            glob.timer_start(glob);
            glob.rate(glob);
        }
    }
    
    userInputEvent (event, glob) {
        let text = event.target.value, words, ranges;
        glob.inpCaratPos = event.target.selectionStart;

        words = glob.divide(text);
        ranges = glob.rangify(text); // get ranges of each words in text

        if((event.keyCode >= 65 && event.keyCode <= 90)) {
            glob.charRate += 1;
        }

        for (var i = ranges.length - 1; i >= 0; i--) {
            if (glob.inpCaratPos <= (ranges[i][1] + 1) && glob.inpCaratPos >= (ranges[i][0])) {
                glob.checkify(glob.spanifiedWords, words, i, glob);
                
                if (glob.lastHighestIndex < i) {
                    glob.lastHighestIndex = i;
                }

                break;
            }

        }

        if (text.length == 0) {
            glob.reset(glob);
        }

    }

    focusin (event, glob) {
        glob.userInputDiv.focus()
    }
    
    //  ** TEST METHODS **
    // convert each word to <span>word</span> and add it to the container
    spanify (parts, elem) {
        let spanifiedWord;
        for (var i = 0; i < parts.length; i++) {
            spanifiedWord = i != parts.length - 1 ? "<span>" + parts[i] + "</span> " : "<span>" + parts[i] + "</span>";
            elem.innerHTML += spanifiedWord;
        }
    
        return elem.children;
    }

    // convert seconds to mm:ss
    timify (secs) {
        let min = Math.floor(secs / 60);
        let sec = secs % 60;

        if (min < 10) {min = "0".concat(min)}
        if (sec < 10) {sec = "0".concat(sec)}
        return min + ":" + sec;
    }

    // returns an array containing start and end index of each word in the text.
    rangify( text) {
        let ranges = [], start = 0, end = 0;
        while (end < text.length && end >= 0) {
            end   = text.indexOf(" ", start);
            ranges.push([start, end != -1 ? end: text.length - 1]);
            start = end + 1;
        }

        return ranges;
    }

    // checks words with the para
    checkify (spans, words, index, glob) {
        if (spans[index].innerText == words[index]) {

            glob.update(spans, index, [glob.classes.correct], [
                glob.classes.selected, glob.classes.wrong, glob.classes.typing], glob);
            
            glob.correctWords.push(index);
            if (glob.wrongWords.includes(index)) {
                glob.wrongWords = glob.wrongWords.filter(function(value, i, arr) {
                    return value != index;
                })
            }
    
        } else {
            glob.update(spans, index, [glob.classes.typing], [
                glob.classes.wrong, glob.classes.correct, glob.classes.selected], glob);
        }
    
        glob.selectify(spans, index, glob);
    
        if ((index - 1) >= 0) {
            if (spans[index - 1].innerText != words[index - 1] && !glob.wrongWords.includes(index - 1)) {
                glob.wrongWords.push(index - 1);
                glob.update(spans, index - 1, [glob.classes.wrong], [
                    glob.classes.correct, glob.classes.selected, glob.classes.typing], glob);
                glob.misspellCount += 1;
            }
        }
    }

    update (spans, index, addClasses = [], removeClasses = [], glob) { // update class of the spanified words
        if (spans && index >= 0) {
            if (index < spans.length) {
                spans[index].className = addClasses.join(' ').toString();

                for (var i = 0; i < removeClasses.length; i++) {
                    if (glob.hasClass(spans[index], removeClasses[i])) {
                        glob.removeClass(spans[index], removeClasses[i]);
                    }
                }
            }
        }
    }

    selectify (spans, index, glob) {
        let loc = "#" + glob.container.id + " #" + glob.paragraphContainerDiv.id + " span." + glob.classes.selected;
        let selections = document.querySelectorAll(loc);
        for (var i = 0; i < selections.length; i++) {
            glob.removeClass(selections[i], glob.classes.selected);
        }

        glob.update(spans, index + 1, [glob.classes.selected], glob);
    }

    // start the timer
    timer_start(glob) { // test timer
        glob.currentTime = glob.time;
        glob.timerInterval = setInterval(function () {
            glob.currentTime -= 1;
            glob.timerDiv.innerText = glob.timify(glob.currentTime);
            if (glob.currentTime == 0) {
                glob.stop();
                if (glob.rateInterval != false) {
                    clearInterval(glob.rateInterval);
                }
                clearInterval(glob.timerInterval);
                glob.timerInterval = false;
                glob.rateInterval = false;
            }
        }, 1000);
    }

    rate (glob) { // gross wpm rate
        glob.rateInterval = setInterval(function () {
            let rate = (glob.charRate/5)/(glob.rateIntervalTiming/60); // gross WPM
            glob.charRate = 0;

            if (glob.rateCallback != false) {
                glob.rateCallback({gwpm: rate});
            } else {
                console.info("Rate: " + rate);
            }
        }, glob.rateIntervalTiming*1000);
    }

    stop () {
        this.calcResult();

        this.userInputDiv.disabled = true;
        this.userInputDiv.value = "";
        this.userInputDiv.placeholder = this.endText;
        if (this.rateInterval != false) {
            clearInterval(this.rateInterval);
        }
        this.reset(this);

    }

    divide (text) {
        return text.split(" ");
    }

    reset(glob) {
        let spans = glob.spanifiedWord;
        for (var i = 0; i <= glob.lastHighestIndex + 1; i++) {
            glob.update(spans, i, [], [
                glob.classes.correct, glob.classes.wrong, glob.classes.selected], glob)
        }
    
        glob.update(spans, 0, [glob.classes.selected], glob);
    
        glob.lastHighestIndex = 0;
        glob.correctWords = [];
        glob.wrongWords = [];
        glob.misspellCount = 0;
        glob.started = false;
    }

    calcResult() {
        let gWPM = Math.round((this.userInputDiv.value.length/5)/(this.time/60));
        let netWPM = Math.round(gWPM - this.wrongWords.length)/(this.time/60);
        let accuracy = Math.round(((this.correctWords.length)/(this.correctWords.length + this.wrongWords.length)) * 100);
        let actualAccuracy = 100 - Math.round((this.misspellCount/((this.correctWords.length + this.wrongWords.length)))*100);
        let result = {
            gwpm: gWPM,
            netwpm: netWPM,
            accuracy: accuracy,
            actualAccuracy: actualAccuracy,
            misspelledWordCount: this.misspellCount
        }

        if (this.resultCallback != false) {
            this.resultCallback(result);
        } else {
            console.log(result);
        }
    }

    // setters
    setResultCallback(callback) {
        this.resultCallback = callback;
    }

    setRateCallback(callback) {
        this.rateCallback = callback;
    }
}
document.addEventListener("DOMContentLoaded", initiate);

function initiate(ev) {
    let test = new TypingTester("testContainer");
    test.initiate();
    test.setRateCallback(function (rate) {
        console.log("Rate : " + rate.gwpm + "wpm");
    });

    test.setResultCallback(function(result) {
        let resultText = "Net WPM: " + result.netwpm + "\nGross WPM: " + result.gwpm + "\nAccuracy: " + result.accuracy + "\nActual accuracy: " + result.actualAccuracy + "\nMisspelled Word Count: " + result.misspelledWordCount;
        alert(resultText);
    })
}
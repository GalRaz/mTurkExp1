/* load psiturk */
var psiturk = new PsiTurk(uniqueId, adServerLoc, mode);

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

// initialize timeline
var timeline = [];

var bot_test = {
  type: 'survey-text',
  questions: [
 {prompt: "<p> To check that you're not a bot: </p>" +
 "<p> What do you see? Describe the shape & color with two words, separated by a comma. </p>", required: true , placeholder: ''}],
 preamble: '<img src="/static/images/shape.png"></img>',
 button_label: 'Continue',
 data: {test_part: 'botcheck'},
}

timeline.push(bot_test);

  var instructions_block = {
      type: "html-button-response",
      stimulus: "<p>This session will last for 7-10min. </p>" +
            "<p> In each trial, you will see a sequence consisting of A's, B's and/or C's. </p>" +
            " <p> <b> After seeing the sequence, press any key, and you will be asked </p>" +
             "<p> to say how random the sequence looks to you. </b> </p>" +
             "<p> A random sequence is one in which A's, B's and C's are equally likely </p>" +
             "<p> to appear in each position. You don't need to calculate </p>" +
            "<p> anything, we simply ask for your intuitive judgments about how random </p>" +
            "<p> the sequences look. Sequences are independent from one another. </p>" +
            "<p> <b> Please make this window full screen so you can see the whole sequence in one row. </b> </p>",
      choices: ['Continue'],
      post_trial_gap: 1000,
      data: {test_part: 'instructions'},
  };

timeline.push(instructions_block);

var data2;
var msg = $.ajax({type: "GET",
url: "https://raw.githubusercontent.com/sradkani/CoCoSci/master/Experiment1/sequencesExp1.csv",
 async: false}).responseText;

console.log(msg)
data2 = Papa.parse(msg)
data2 = data2['data']

// get random subarray of sequences (half the length)
data2 = getRandomSubarray(data2, Math.round(data2.length/2))


var data2 = Object.values(data2);
console.log(Object.values(data2[0]).toString())

var test_stimuli = []
function csvValues(){
var arrayLength = data2.length;
  for (var i = 0; i < arrayLength; i++) {

    test_stimuli.push({stimulus: '<div style="font-size:40px;">' +
    Object.values(data2[i]).toString().replace(/,/g, '  ') +
    '</div>', data: {test_part: 'test'}})
}
}

csvValues();

var progress_bar = 0;
var tick_amount = 0.0158;
      // sample from test_stimuli
 var symbol = {
   type: "html-keyboard-response",
   stimulus: jsPsych.timelineVariable('stimulus'),
   choices: jsPsych.ALL_KEYS,
   post_trial_gap: 500,
   data: jsPsych.timelineVariable('data'),
   on_finish: function() {
  progress_bar += tick_amount;
  jsPsych.setProgressBar(progress_bar);
}
 }

var scale_1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

var rating = {
  type: 'survey-likert',
  questions: [
    {prompt: "<p>  Give a rating from 1 (very unlikely) to 10 (very likely)  </p>", labels: scale_1, required:true}
  ],
  preamble: "<p> <b> How likely is it that this sequence came from a random process </p>" +
  "<p>  (A, B, C are equally likely to appear in each position)?  </b> </p>",
  button_label: ['Continue'],
  data: {test_part:'likert'},
};

/* define sequence procedure */
var sequence = {
  timeline: [symbol, rating],
  timeline_variables: test_stimuli,
  randomize_order: true,
}

timeline.push(sequence);

var end_exp = {
  type: 'html-button-response',
  stimulus: "<p> Thank you for completing this experiment. </p>",
  choices: ['Exit'],
  data: {test_part: 'exitpage'},
}
timeline.push(end_exp);

/* record id, condition, counterbalance on every trial */
jsPsych.data.addProperties({
    uniqueId: uniqueId,
    condition: condition,
    counterbalance: counterbalance
});

jsPsych.init({
    display_element: 'jspsych-target',
    timeline: timeline,
    show_progress_bar: true,
    auto_update_progress_bar: false,
    // record data to psiTurk after each trial
    on_data_update: function(data) {
        psiturk.recordTrialData(data);
    },
    on_finish: function() {
        // save data
        psiturk.saveData({
            success: function() {
                // upon saving, add proportion correct as a bonus (see custom.py) and complete HIT
                    psiturk.completeHIT();
            }})
    }});

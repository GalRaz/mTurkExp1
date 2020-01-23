/* load psiturk */
var psiturk = new PsiTurk(uniqueId, adServerLoc, mode);

var timeline = [];
  var welcome = {
    type: "text",
    text: "<p>Hi! Thanks so much for participating in our experiment! </p>" +
    "<p> This HIT is part of a MIT scientific research project. Your decision to complete this HIT is voluntary. </p>" +
    "<p> There is no way for us to identify you. The only information we will have, in addition to your responses, </p>" +
    "<p> is the time at which you completed the survey. The results of the research may be presented  </p>" +
    "<p> at scientific meetings or published in scientific journals. Clicking on the 'SUBMIT' button on the bottom of </p>" +
    "<p> this page indicates that you are at least 18 years of age and agree to complete this HIT voluntarily. </p>" +
    "<p> Press SPACE to continue </p>",
    cont_key: [' '],
  };
  timeline.push(welcome);

  var instructions_block = {
      type: "text",
      text: "<p>This session will last for 10min. </p>" +
            "<p> In each trial, you will see a sequence consisting A's, B's and/or C's. </p>" +
            " <p> After seeing the sequence, press any key, and you will be asked </p>" +
             "<p> to judge how likely it is that the sequence came from a random process. </p>" +
            "<p> Each sequence is independent from one another. </p>",
      timing_post_trial: 1000,
      cont_key: [' '],
      on_finish: function(){
          psiturk.finishInstructions();
      }
  };

timeline.push(instructions_block);

var data2;
var msg = $.ajax({type: "GET",
url: "https://raw.githubusercontent.com/sradkani/CoCoSci/master/Experiment%201/sequences.csv",
 async: false}).responseText;

console.log(msg)
data2 = Papa.parse(msg)
data2 = data2['data']

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

      // sample from test_stimuli
 var symbol = {
   type: "single-stim",
   stimulus: jsPsych.timelineVariable('stimulus'),
   choices: jsPsych.ALL_KEYS,
   is_html: true,
   post_trial_gap: 500,
   data: jsPsych.timelineVariable('data'),
 }

var scale_1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

var rating = {
  type: 'survey-likert',
  questions: [
    {prompt: "<p>  Give a rating from 1 (very unlikely) to 10 (very likely)  </p>", labels: scale_1, required:true}
  ],
  preamble: "<p> <b> How likely is it that this sequence came from a random process </p>" +
  "<p> (equal probability of A,B,C for each item)?  </b> </p>",
  button_label: ['Continue'],

};

/* define sequence procedure */
var sequence = {
  timeline: [symbol, rating],
  timeline_variables: test_stimuli,
  randomize_order: true,
  //repetitions: 5
}

timeline.push(sequence);

/* stimuli specifications */
var trials = [
    {
        stimulus: "<p style='font-size: 50px; color: red;'>SHIP</p>",
        data: {word: 'SHIP', color: 'red', stimulus_type: 'unrelated', correct_response: 'R'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: green;'>MONKEY</p>",
        data: {word: 'MONKEY', color: 'green', stimulus_type: 'unrelated', correct_response: 'G'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: blue;'>ZAMBONI</p>",
        data: {word: 'ZAMBONI', color: 'blue', stimulus_type: 'unrelated', correct_response: 'B'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: red;'>RED</p>",
        data: {word: 'RED', color: 'red', stimulus_type: 'congruent', correct_response: 'R'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: green;'>GREEN</p>",
        data: {word: 'GREEN', color: 'green', stimulus_type: 'congruent', correct_response: 'G'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: blue;'>BLUE</p>",
        data: {word: 'BLUE', color: 'blue', stimulus_type: 'congruent', correct_response: 'B'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: red;'>GREEN</p>",
        data: {word: 'GREEN', color: 'red', stimulus_type: 'incongruent', correct_response: 'R'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: green;'>BLUE</p>",
        data: {word: 'BLUE', color: 'green', stimulus_type: 'incongruent', correct_response: 'G'}
    },
    {
        stimulus: "<p style='font-size: 50px; color: blue;'>RED</p>",
        data: {word: 'RED', color: 'blue', stimulus_type: 'incongruent', correct_response: 'B'}
    }
];

var fixation = {
    type: 'single-stim',
    stimulus: '<p style="font-size: 50px;">+</p>',
    choices: jsPsych.NO_KEYS,
    timing_response: 500,
    is_html: true,
    data: {stimulus_type: 'fixation'}
};

var word = {
    type: 'single-stim',
    stimulus:  jsPsych.timelineVariable('stimulus'),
    choices: ['r','g', 'b'],
    is_html: true,
    data: jsPsych.timelineVariable('data'),
    on_finish: function(d){
        d.correct = d.key_press == d.correct_response.charCodeAt(0);
    }
};

var test_procedure = {
    timeline: [fixation, word],
    timeline_variables: trials,
    randomize_order: true
};
timeline.push(test_procedure);

var summary = {
    type: 'single-stim',
    stimulus: function(){
        var congruent_rt = jsPsych.data.get().filter({stimulus_type: 'congruent'}).select('rt').mean();
        var incongruent_rt = jsPsych.data.get().filter({stimulus_type: 'incongruent'}).select('rt').mean();
        var unrelated_rt = jsPsych.data.get().filter({stimulus_type: 'unrelated'}).select('rt').mean();
        var congruent_pct = 100 * jsPsych.data.get().filter({stimulus_type: 'congruent'}).select('correct').mean();
        var incongruent_pct = 100 * jsPsych.data.get().filter({stimulus_type: 'incongruent'}).select('correct').mean();
        var unrelated_pct = 100 * jsPsych.data.get().filter({stimulus_type: 'unrelated'}).select('correct').mean();
        return '<p>Your average response time on congruent trials was '+Math.round(congruent_rt)+'ms. '+
            'Your average response time on incongruent trials was '+Math.round(incongruent_rt)+'ms. '+
            'Your average response time on unrelated trials was '+Math.round(unrelated_rt)+'ms.</p>'+
            '<p>Your average percent correct on congruent trials was '+Math.round(congruent_pct)+'%. '+
            'Your average percent correct on incongruent trials was '+Math.round(incongruent_pct)+'%. '+
            'Your average percent correct on unrelated trials was '+Math.round(unrelated_pct)+'%.</p>'+
            '<p>Thanks for participating! Press "q" to finish the experiment.</p>';
    },
    choices: ['q'],
    is_html: true
};
timeline.push(summary);

/* record id, condition, counterbalance on every trial */
jsPsych.data.addProperties({
    uniqueId: uniqueId,
    condition: condition,
    counterbalance: counterbalance
});

jsPsych.init({
    display_element: 'jspsych-target',
    timeline: timeline,
    // record data to psiTurk after each trial
    on_data_update: function(data) {
        psiturk.recordTrialData(data);
    },
    on_finish: function() {
        // record proportion correct as unstructured data
        psiturk.recordUnstructuredData("bonus", jsPsych.data.get()
                                       .filter([{stimulus_type: 'incongruent'},
                                                {stimulus_type: 'congruent'},
                                                {stimulus_type: 'unrelated'}])
                                       .select('correct')
                                       .mean()
                                       .toFixed(2));
        // save data
        psiturk.saveData({
            success: function() {
                // upon saving, add proportion correct as a bonus (see custom.py) and complete HIT
                psiturk.computeBonus("compute_bonus", function () {
                    psiturk.completeHIT();
                });
            }
        });
    },
});

// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


class LearnWord {
  constructor(word, counter) {
    this.word = word;
    this.counter = counter || 1;
  }
}

var scope = "test";


function extension_log (message) {
  var script = 'console.log(`' + message + '`);';
  chrome.tabs.executeScript({
    code: script
  });
}

function extension_alert (message) {
  var script = 'alert(`' + message + '`);';
  chrome.tabs.executeScript({
    code: script
  });
}

function clearStorage() {
  chrome.storage.sync.set({scope: {}}, function() {
    addAlertBox("success", "Cleared storage.");
  });
}

function saveNewWord(word) {
  chrome.storage.sync.get([scope], function(result) {
    var dict = result[scope]?result[scope]:{};
    var box_message = "";
    if (dict.hasOwnProperty(word)) {
      var learnWord = dict[word];
      learnWord.counter++;
      box_message = ("Updated '" + word + "' to value "
                    + learnWord.counter + ".");
    } else {
      dict[word] = new LearnWord(word);
      box_message = "Saved '" + word + "'.";
    }

    var jsonObj = {};
    jsonObj[scope] = dict;
    chrome.storage.sync.set(jsonObj, function() {
      addAlertBox("success", box_message);
    });
  });
}

function getUserWords(callback) {
  chrome.storage.sync.get(scope, (result) => {
    var word = result[scope]?result[scope]:{};
    callback(word);
  });
}

function addNewWord () {
  var script = `
      var text = "";
      if (window.getSelection) {
        text = window.getSelection().toString();
      } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
      }
      text
  `;
  chrome.tabs.executeScript({
      code: script
    },
    function (resultArr){
      // Bear in mind this validation.
      // if(validate_word(resultArr)) {

      saveNewWord(resultArr);
  });
}

function log_json(input) {
  extension_log(JSON.stringify(input, 0, 2));
}

function showWords() {
  getUserWords(createWordsTable);
}

function init_close_alerts() {
  // TODO Refactor this function.
  document.getElementById('alert').style.display = 'none';
  var close = document.getElementsByClassName("closebtn");
  var i;

  for (i = 0; i < close.length; i++) {
      close[i].onclick = function(){
          var div = this.parentElement;
          div.style.opacity = "0";
          setTimeout(function(){ div.style.display = "none"; }, 600);
      };
  }
}

function validate_word(input) {
  return not_contain_special_chars(input);
}

function createWordsTable(words) {
  // TODO Refactor this function.
  var table_div = document.getElementById('words-table');
  var tbl = document.createElement('table');
  tbl.style.width = '100%';
  tbl.setAttribute('border', '1');
  var tbdy = document.createElement('tbody');

  for (var key in words) {
    var tr = document.createElement('tr');

    var td_key = document.createElement('td');
    td_key.innerHTML = key;

    var td_value = document.createElement('td');
    td_value.innerHTML = words[key].counter;

    tr.appendChild(td_key);
    tr.appendChild(td_value);
    tbdy.appendChild(tr);
  }
  tbl.appendChild(tbdy);

  table_div.appendChild(tbl);
  table_div.display = 'block';
}

function not_contain_special_chars (input) {
  var result = (/^[/'a-zA-Z0-9- ]*$/.test(input) == true);
  if(!result)
  {
    addAlertBox("warning", "The word \"" + input +
      "\" contains special characters");
  }
  return result;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function addAlertBox(type, message) {
  document.getElementById('alert').style.display = 'block';
  document.getElementById('alert').className = type;
  document.getElementById('alert-type').innerHTML = (
    capitalizeFirstLetter(type) + "!");
  document.getElementById('alert-text').innerHTML = message;
}

function addToMemrise(){
}

// Function called on reload page.
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add_word').onclick = addNewWord;
  document.getElementById('check_words').onclick = showWords;
  document.getElementById('add_to_memrise').onclick = addToMemrise;

  init_close_alerts();
});

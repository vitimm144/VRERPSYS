/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
String.prototype.toBytes = function() {
  var arr = []
  for (var i=0; i < this.length; i++) {
      arr.push(this[i].charCodeAt(0))
  }

  return arr;
};

function charCodeLatina(doc){
  doc.push(0x1b, 0x52, 0x0C);
}

function fontA(doc) {
    doc.push(0x1b, 0x4d, 0x00);
}

function fontB(doc) {
    doc.push(0x1b, 0x4d, 0x01);
}

function alignLeft(doc) {
    doc.push(0x1b, 0x61, 0x00);
}

function alignCenter(doc) {
    doc.push(0x1b, 0x61, 0x01);
}

function alignRight(doc) {
    doc.push(0x1b, 0x61, 0x02);
}

function normal(doc, text) {
    for (var i = 0; i < text.length; i++) {
        doc.push(text[i].charCodeAt(0))
    }
}

function doubleHeight(doc, text) {
    doc.push(0x1b, 0x21, 0x10);
    normal(doc, text);
    doc.push(0x1b, 0x21, 0x00);
}

function doubleWidth(doc, text) {
    doc.push(0x1b, 0x21, 0x20);
    normal(doc, text);
    doc.push(0x1b, 0x21, 0x00);
}

function underline(doc, text) {
    doc.push(0x1b, 0x2d, 0x01);
    normal(doc, text);
    doc.push(0x1b, 0x2d, 0x00);
}

function underline2(doc, text) {
    doc.push(0x1b, 0x2d, 0x02);
    normal(doc, text);
    doc.push(0x1b, 0x2d, 0x00);
}

function bold(doc, text) {
    doc.push(0x1b, 0x45, 0x01);
    normal(doc, text);
    doc.push(0x1b, 0x45, 0x00);
}

function lineFeed(doc, length) {
    doc.push(0x01B, 0x64, length || 1);
}

function fullCut(doc) {
    lineFeed(doc, 5);
    doc.push(0x1d, 0x56, 0x00);
}


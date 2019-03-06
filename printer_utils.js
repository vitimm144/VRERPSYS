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
//  doc.push(0x1B, 0x52, 0x12);
  doc.push(0x1B, 0x52, 12);
//  doc.push(0x1d, 0xF9, 0x37, 0);
//  doc.push(0x1B, 0x74, 6);
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

function setPrinterLanguage(doc, ln){
  // o parametro ln significa a linguagem
  // ln = 0 or 30 - english
  //ln = 1 or 31 - portuguese
  doc.push(0x29, 0xFA, 0x01)
}

function underline2(doc, text) {
    doc.push(0x1B, 0x2D, 1);
    normal(doc, text);
    doc.push(0x1B, 0x2D, 0);
}

function bold(doc, text) {
    doc.push(0x1B, 0x45);
    normal(doc, text);
    doc.push(0x1B, 0x46);
}

function printUserConfig(doc) {
    doc.push(0x1D, 0xF9, 0x29, 0x30);
}

function printSuportedUnicodeSets(doc){
  doc.push(0x1B, 0x5A)
}

function lineFeed(doc, length) {
//    doc.push(0x01B, 0x64, length || 1);
    doc.push(0x1B, 0x4A, length || 1);
//    doc.push(0x4a,0x00);
}

function fullCut(doc) {
    lineFeed(doc, 5);
//    doc.push(0x1d, 0x56, 0x00);
//    doc.push('\x1d\x56\x00');
    doc.push(0x1B, 0x69);

//    doc.push(0x1b, 0x64, 0x02);
}


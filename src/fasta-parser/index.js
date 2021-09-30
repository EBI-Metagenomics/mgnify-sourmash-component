/* eslint-disable no-undef */

// Minor adaption of https://www.npmjs.com/package/fasta-parser to replace tabs in headers
import split from 'split';
import through from 'through2';
import pumpify from 'pumpify';
import BufferList from 'bl';

function parser() {
  var cacheBuf;
  var openID = new Buffer('{"id":"');
  var closeIDOpenSeq = new Buffer('","seq":"');
  var closeSeq = new Buffer('"}\n');
  var stream = through(transform, flush);

  return stream;

  function transform(buf, enc, next) {
    if (buf[0] === 62) {
      // If line starts with '>', this is an ID
      if (cacheBuf) {
        // If a previous object is in cache, push it
        cacheBuf.append(closeSeq);
        this.push(cacheBuf.slice());
      }
      var id = buf
        .toString()
        .slice(1)
        .trim()
        .replace(/"/g, '\\"')
        .replace(/\t/g, '\\"');
      cacheBuf = new BufferList();
      cacheBuf.append(openID);
      cacheBuf.append(id);
      cacheBuf.append(closeIDOpenSeq);
    } else {
      cacheBuf.append(buf);
    }
    next();
  }

  function flush() {
    cacheBuf.append(closeSeq);
    this.push(cacheBuf.slice());
    this.push(null);
  }
}

function fastaParser() {
  return pumpify(split(), parser());
}

export default fastaParser;

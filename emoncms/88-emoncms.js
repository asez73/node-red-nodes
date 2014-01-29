/**
 * Copyright Henrik Olsson henols@gmail.com Copyright 2013 IBM Corp.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var RED = require(process.env.NODE_RED_HOME+"/red/red");

function Emoncms(n) {
	RED.nodes.createNode(this,n);
	this.baseurl = n.baseurl || "";
	this.topic = n.topic ||"";
	this.apikey = n.apikey || "";
	this.nodegroup = n.nodegroup || "";
	var node = this;
	if (this.baseurl.substring(0,5) === "https") { var http = require("https"); }
	else { var http = require("http"); }
	this.on("input", function(msg) {
		
		var topic = this.topic || msg.topic;
		this.url = this.baseurl + '/input/post.json?json={' + topic + ':' + msg.payload+'}&apikey='+this.apikey;
		if(this.nodegroup != ""){
			this.url += '&node='+this.nodegroup;
		}
		node.log("[emoncms] "+this.url);
		http.get(this.url, function(res) {
			node.log("Http response: " + res.statusCode);
 			msg.rc = res.statusCode;
			msg.payload = "";
			if ((msg.rc != 200) && (msg.rc != 404)) {
				node.send(msg);
			}
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				msg.payload += chunk;
			});
			res.on('end', function() {
				node.send(msg);
			});
		}).on('error', function(e) {
			// node.error(e);
			msg.rc = 503;
			msg.payload = e;
			node.send(msg);
		});
	});
}

RED.nodes.registerType("emoncms",Emoncms);

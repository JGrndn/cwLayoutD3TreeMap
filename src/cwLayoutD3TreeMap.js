/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

(function(cwApi, $) {
	"use strict";
	/*global cwAPI, jQuery */

	var cwLayoutD3TreeMap = function(options, viewSchema) {
		cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
		this.drawOneMethod = cwLayoutD3TreeMap.drawOne.bind(this);
		this.hasTooltip = true;
		cwApi.registerLayoutForJSActions(this);
		this.init = true;
	};

	cwLayoutD3TreeMap.drawOne = function(output, item, callback, nameOnly) {
	};

	cwLayoutD3TreeMap.prototype.getObjectsByLookup = function(allItems) {
		var groupData, sortedGroupData, filter, undefinedValue, undefinedText;
		//filter = "";
		filter = this.options.CustomOptions['group-by-property'].toLowerCase();

		// Group Objects By Type
		groupData = cwApi.groupBy(allItems, function(obj) {
			return obj.properties[filter];
		});
		sortedGroupData = this.sortObjectByKey(groupData);

		undefinedValue = cwApi.getLookupUndefinedValue();
		undefinedText = $.i18n.prop('global_undefined');
		//sortedGroupData.renameProperty(undefinedValue, undefinedText);
		cwApi.replacePropertyKey(sortedGroupData, undefinedValue, undefinedText);

		return sortedGroupData;
	};

	cwLayoutD3TreeMap.prototype.sortObjectByKey = function(groupData) {
		var sortedObj, keys;
		keys = Object.keys(groupData);
		keys.sort();
		sortedObj = this.setUndefinedAtBottom(keys, groupData);
		return sortedObj;
	};

	cwLayoutD3TreeMap.prototype.setUndefinedAtBottom = function(keys, groupData) {
		var sortedObj, i;
		sortedObj = {};
		// create new array based on Sorted Keys
		for (i = 0; i < keys.length; i += 1) {
			sortedObj[keys[i]] = groupData[keys[i]];
		}
		return sortedObj;
	};

	cwLayoutD3TreeMap.prototype.drawAssociations = function(output, associationTitleText, object) {
		var i, s, child, associationTargetNode, objectId, sortedItems, sizeProperty, that = this;
		sizeProperty = this.options.CustomOptions['size'].toLowerCase();

		if (cwApi.isUndefinedOrNull(object) || cwApi.isUndefined(object.associations)) {
			// Is a creation page therefore a real object does not exist
			if (!cwApi.isUndefined(this.mmNode.AssociationsTargetObjectTypes[this.nodeID])) {
				objectId = 0;
				associationTargetNode = this.mmNode.AssociationsTargetObjectTypes[this.nodeID];
			} else {
				return;
			}
		} else {
			if (!cwApi.isUndefined(object.associations[this.nodeID])) {
				objectId = object.object_id;
				associationTargetNode = object.associations[this.nodeID];
			} else {
				return;
			}
		}


		var data = {
			"name": "",
			"children": []
		};

		var sortedItems = this.getObjectsByLookup(associationTargetNode);
		for (var key in sortedItems) {
			var node = {
				"name": "",
				"children": []
			};
			
				node.name = key;
				var subItems = sortedItems[key];
			if (subItems) {
				var subItemsLength = subItems.length;
				for (i = 0; i < subItems.length; i += 1) {
					var subItem = subItems[i];
					var leafNode = {};
					leafNode.name = that.displayProperty.getDisplayString(subItem);
					leafNode.value = subItem.properties[sizeProperty]
			
					node.children.push(leafNode);
				}
				data.children.push(node);
			}
		}
		this.data = data;

		// display helptext if exists
		for(var pgId in this.mmNode.PropertiesGroups){
			if (this.mmNode.PropertiesGroups.hasOwnProperty(pgId)){
				var propertyGroupSchema = cwApi.ViewSchemaManager.getPropertyGroup(this.viewSchema, pgId),
          			objectTypeScriptName = this.mmNode.ObjectTypeScriptName.toLowerCase();
      			if (propertyGroupSchema.layout === 'helptext'){
					cwApi.cwPropertiesGroups.displayPropertiesGroupFromKey(output, null, propertyGroupSchema, objectTypeScriptName);
				}
			}
		}
		output.push('<div class="cw-treemap" id="cw-treemap-', this.nodeID, '"></div>');
		
	};

	cwLayoutD3TreeMap.prototype.createTreemap = function() {
		d3.chart.treemap("#cw-treemap-" + this.nodeID, this.data);
	};
	cwLayoutD3TreeMap.prototype.applyJavaScript = function () {
        if(this.init) {
            this.init = false;
            var that = this;
            var libsToLoad = ['modules/d3/d3.min.js'];
                // AsyncLoad
            cwApi.customLibs.aSyncLayoutLoader.loadUrls(libsToLoad,function(error){
                if(error === null) {
                    libsToLoad = ['modules/d3/d3.treemap.js']; 
                    cwApi.customLibs.aSyncLayoutLoader.loadUrls(libsToLoad,function(error){
                        if(error === null) {
                            that.createTreemap(); 
                        } else {
                            cwAPI.Log.Error(error); 
                        }
                    });            
                } else {
                    cwAPI.Log.Error(error);
                }
            });
        }
    };

	cwApi.cwLayouts.cwLayoutD3TreeMap = cwLayoutD3TreeMap;
}(cwAPI, jQuery));
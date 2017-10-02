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
		this.layoutsByNodeId = {};
	};

	cwLayoutD3TreeMap.drawOne = function(output, item, callback, nameOnly) {
	};

	cwLayoutD3TreeMap.prototype.getObjectsByLookup = function(allItems) {
		var groupData, sortedGroupData, filter, undefinedValue, undefinedText;
		//filter = "";
		filter = this.options.CustomOptions['group-by-property-scriptname'].toLowerCase();

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

	cwLayoutD3TreeMap.prototype.getLastNodeId = function() {
		var n, nodes = this.viewSchema.NodesByID;
		for(n in nodes){
			if (nodes.hasOwnProperty(n)){
				if (nodes[n].SortedChildren.length === 0){
					return n;
				}
			}
		}
	};

	cwLayoutD3TreeMap.prototype.getDisplayString = function(item){
		var l, getDisplayStringFromLayout = function(layout){
            return layout.displayProperty.getDisplayString(item);
        };
        if (item.nodeID === this.nodeID){
            return this.displayProperty.getDisplayString(item);
        }
        if (!this.layoutsByNodeId.hasOwnProperty(item.nodeID)){
            if (this.viewSchema.NodesByID.hasOwnProperty(item.nodeID)){
                var layoutOptions = this.viewSchema.NodesByID[item.nodeID].LayoutOptions;
                this.layoutsByNodeId[item.nodeID] = new cwApi.cwLayouts[item.layoutName](layoutOptions, this.viewSchema);
            } else {
                return item.name;
            }
        }
        return getDisplayStringFromLayout(this.layoutsByNodeId[item.nodeID]);
	};

	cwLayoutD3TreeMap.prototype.getLeaf = function(item, stopNodeId) {
		var associationNode, data = {}, sizeProperty = this.options.CustomOptions['size'].toLowerCase(), i, o, p;
		data.name = this.getDisplayString(item);
		data.item = item;
		data.cwlayout = this;
		if (item.nodeID.toLowerCase() === this.options.CustomOptions['navigation-node-id'].toLowerCase()){
			data.url = cwApi.createLinkForSingleView(item.objectTypeScriptName, item);
			if (item.properties.hasOwnProperty(this.colorOptions.property)){
				p = item.properties[this.colorOptions.property + '_abbreviation'].toLowerCase();
				if (this.colorOptions.values.hasOwnProperty(p)){
					data.color = this.colorOptions.values[p];
				} else {
					data.color = 'whitesmoke';
				}
			}
		}

		if (item.nodeID === stopNodeId || this.options.CustomOptions['group-by-property'] === true){
			data.value = item.properties[sizeProperty];
		} else {
			data.children = [];
			for(associationNode in item.associations){
				if (item.associations.hasOwnProperty(associationNode)){
					for (i = 0; i < item.associations[associationNode].length; i+=1) {
						o = item.associations[associationNode][i];
						data.children.push(this.getLeaf(o, stopNodeId));
					}
				}
			}
		}
		return data;
	};

	cwLayoutD3TreeMap.prototype.drawAssociations = function(output, associationTitleText, object) {
		var data, objectId, associationTargetNode, endOfTreeNodeId, sortedItems, key, node, subItems, i, pgId,
		propertyGroupSchema, objectTypeScriptName;

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

		if (this.options.CustomOptions['color'] != ''){
			try{
				this.colorOptions = JSON.parse(this.options.CustomOptions['color']);
			}catch(err){
				this.colorOptions = undefined;
			}
		}
		
		data = {
			"name": "",
			"children": []
		};

		endOfTreeNodeId = this.getLastNodeId();

		if (this.options.CustomOptions['group-by-property'] === true){
			sortedItems = this.getObjectsByLookup(associationTargetNode);
			for (key in sortedItems) {
				node = {
					"name": "",
					"children": []
				};
			
				node.name = key;
				subItems = sortedItems[key];
				if (subItems) {
					for (i = 0; i < subItems.length; i += 1) {
						node.children.push(this.getLeaf(subItems[i], endOfTreeNodeId));
					}
					data.children.push(node);
				}
			}
		}
		else{
			for(i = 0; i<associationTargetNode.length; i+=1){
				data.children.push(this.getLeaf(associationTargetNode[i], endOfTreeNodeId));
			}
		}
		this.data = data;


		// display helptext if exists
		for(pgId in this.mmNode.PropertiesGroups){
			if (this.mmNode.PropertiesGroups.hasOwnProperty(pgId)){
				propertyGroupSchema = cwApi.ViewSchemaManager.getPropertyGroup(this.viewSchema, pgId);
        objectTypeScriptName = this.mmNode.ObjectTypeScriptName.toLowerCase();
  			if (propertyGroupSchema.layout === 'helptext'){
					cwApi.cwPropertiesGroups.displayPropertiesGroupFromKey(output, null, propertyGroupSchema, objectTypeScriptName);
				}
			}
		}
		output.push('<div class="cw-treemap" id="cw-treemap-', this.nodeID, '"></div>');
		
	};

	cwLayoutD3TreeMap.prototype.createTreemap = function() {
		var options = {};
		d3.chart.treemap("#cw-treemap-" + this.nodeID, this.data, options);
	};
	cwLayoutD3TreeMap.prototype.applyJavaScript = function () {
    if (cwApi.isUndefined(this.data)){
    	return;
    }
    if(this.init) {
      this.init = false;
      if (!this.data)
      	return;
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

    cwLayoutD3TreeMap.prototype.openView = function(item) {
    	var hash = cwApi.getSingleViewHash(item.objectTypeScriptName.toLowerCase(), item.object_id);
    	cwApi.updateURLHash(hash);
    };

	cwLayoutD3TreeMap.prototype.openPopout = function(item) {
		var popout = this.options.CustomOptions['navigation-popout'].toLowerCase();
		if (popout){
    		cwApi.cwDiagramPopoutHelper.openDiagramPopout(item, popout);
    	}
	};

	cwApi.cwLayouts.cwLayoutD3TreeMap = cwLayoutD3TreeMap;
}(cwAPI, jQuery));
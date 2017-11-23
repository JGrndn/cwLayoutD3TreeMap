## Description
The Treemap layout allows to display data according 2 axis. It gather objects (depending a value of their attribute or linked objects) and organize them on a chart. The size depends on the value of another attribute.  

## Installation  
[https://github.com/casewise/cpm/wiki](https://github.com/casewise/cpm/wiki)  

## How to set up the treemap layout
### Group objects using an attribute
First you need to create the following page structure.  

<img src="https://github.com/JGrndn/cwLayoutD3TreeMap/blob/master/screen/3.JPG" style="width:95%" />  

_Please note you can display the treemap without using tabs in your page._  

Then you need to check **Group by property** and fullfill the options **Group by property (scriptname)** and **Size/Volume** with the property scriptnames (lowercase). There is no constraint with the **Group by property**. However the **Size/Volume** property needs to be an integer property.  
<img src="https://github.com/JGrndn/cwLayoutD3TreeMap/blob/master/screen/4.JPG" style="width:95%" />  

### Group objects using linked objects
First you need to create the following page structure.  

<img src="https://github.com/JGrndn/cwLayoutD3TreeMap/blob/master/screen/1.JPG" style="width:95%" />  

_Please note you can display the treemap without using tabs in your page._  

Then you need to check **Group by property** and fullfill the options **Group by property (scriptname)** and **Size/Volume** with the property scriptnames (lowercase). There is no constraint with the **Group by property**. However the **Size/Volume** property needs to be an integer property. The **Size/Volume** property must be a property on the last node (here it is the _application_ node)  
<img src="https://github.com/JGrndn/cwLayoutD3TreeMap/blob/master/screen/2.JPG" style="width:95%" />

You can also define the color for the displayed objects. To do so, fill the **Color** option with the following value :  
```
{
  "property":"status", 
  "values":{
     "t":"green", 
     "d":"red"
  }
}
```
In this example, "status" is the property scriptname set in the **Size/Volume** field. "t" and "d" are possible values of this status property.  


Once the configuration is set up, deploy your website (don't forget to deploy themes too !)  

## Result  
Below is a screenshot of what you get once your treemap is correctly configured  
<img src="https://github.com/JGrndn/cwLayoutD3TreeMap/blob/master/screen/6.JPG" style="width:95%" />  

You can click on a group of object to zoom-in. To zoom-out, click on the black ribbon above the chart.
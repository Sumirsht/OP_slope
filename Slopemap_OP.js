//This script is creating the slope map according to the Operational plan of Nepal//
//Importing the shapefile of Nepal//
var nepal = ee.FeatureCollection("projects/ee-sumirsht123/assets/herme_1984_Nepal");

// roi as Community forest shapefile
var roi = ee.FeatureCollection("projects/ee-sumirsht123/assets/Makwanpur"); // I have use the Makwanpur district as of Community Forestry

//Get the srtm data//
var srtm = ee.Image("USGS/SRTMGL1_003");

//Get elevation from srtm//
var elev = srtm.select('elevation');

// Get slope//
var slope = ee.Terrain.slope(elev);

//Clip srtm dem by nepal
var slope_nepal = slope.clip(nepal);

//Displaying in the Map
//Map.addLayer(slope_nepal, {min:0, max:60}, 'Slope Nepal');
//Map.centerObject(nepal, 5);

//Remape slope class/reclassification function//
var sloperclass = ee.Image(1) //In my case i will reclass slope into 5 classes ('0-10','10-19','19-32','32-45','>45')
          .where(slope_nepal.gt(10).and(slope_nepal.lte(19)), 2) //gt: greater than and lte: less than or equals to//
          .where(slope_nepal.gt(19).and(slope_nepal.lte(32)), 3)
          .where(slope_nepal.gt(32).and(slope_nepal.lte(45)), 4)
          .where(slope_nepal.gt(45).and(slope_nepal.lte(100)), 5)
          
//Define Colors/palettes//
//HTML color codes: https://htmlcolorcodes.com/
var slope_palette = ['0C7600','4CE500','e9d913','ef5f1b','FF0000'];

//Display Reclassified slope image
//Map.addLayer(sloperclass.clip(nepal), {min:1, max:5, palette:slope_palette}, 'Reclassified Slope Nepal');
Map.addLayer(sloperclass.clip(roi), {min:1, max:5, palette:slope_palette}, 'OP slope');
Map.centerObject(roi, 10);

//Area Calculation (sq.km.)
/*var area_classified = ee.Image.pixelArea().divide(1000*1000).addBands(sloperclass).reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName:'slope_class',
  }),
  geometry: nepal.geometry(),
  scale: 30,
  maxPixels: 10e10
});*/

//Area calculation of CF (Ha)
var area_CF = ee.Image.pixelArea().divide(10000).addBands(sloperclass).reduceRegion({   //This one is in the hecatres.
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName:'slope_class',
  }),
  geometry: roi.geometry(),
  scale: 30,
  maxPixels: 10e10
});

//Print the area of each class
//print('Area of slope class (Sq.km)', area_classified);
print('Area of CF in slope (Ha)', area_CF);

//Export the classified image to Drive, specify scale and region
/*Export.image.toDrive({
  image: sloperclass.clip(nepal),
  region: nepal,
  description: 'Reclassified_Slope_Nepal',
  scale: 30,
  maxPixels: 1e12
});*/

//Export the classified image of the Community Forest slope
Export.image.toDrive({
  image: sloperclass.clip(roi),
  region: roi,
  description: 'Reclassified_Slope_CF',
  scale: 30,
  maxPixels: 1e12
});

/////////////////////////////////////////////////////////////
 /************************ legend ****************************/
 //////////////////////////////////////////////////////////////
 
// name of the legend
var names = ['0-10','10-19','19-32','32-45','>45'];
// set names length (i)
var values = [ '1', '2', '3','4','5'];
    
// set position of panel
var legend = ui.Panel({style: { position: 'bottom-left', padding: '8px 16px'}});
 
// Create legend title
var legendTitle = ui.Label({value: 'Legend',style: {
  fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0', padding: '0' }});
 
// Add the title to the panel
legend.add(legendTitle);
 
// Create sub title
var legendsubTitle = ui.Label({value: 'Slope in Degree',style: {
  fontWeight: 'bold', fontSize: '15px', margin: '0 0 4px 0', padding: '0' }});
 
// Add the title to the panel
legend.add(legendsubTitle);
var makeRow = function(color, name) {
  // Create the label that is actually the colored box.
  var colorBox = ui.Label({
    style: {
      backgroundColor: '#' + color, padding: '8px',margin: '0 0 4px 0'} });
  // Create the label filled with the description text.
  var description = ui.Label({
    value: name, style: {margin: '0 0 4px 6px'}});
  // return the panel
  return ui.Panel({
    widgets: [colorBox, description],layout: ui.Panel.Layout.Flow('horizontal')})};
 
// Add color and and names
for (var i = 0; i < 5; i++) {
  legend.add(makeRow(slope_palette[i], names[i]));
  }  
// Add the legend to the map.
Map.add(legend);
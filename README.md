# gc-portfolio dashboard
## Description
gc-portfolio is an JavaScript/HTML app for visualizing the outputs of the ag|knowledge REST API from [geocledian](https://www.geocledian.com).
It is built with the [Vue.js](https://www.vuejs.org) components gc-chart and gc-list and includes an internal extended gc-portfolio-map component.

## Purpose
With this application you have an interactive map widget for visualizing outputs from the REST API of ag|knowledge from geocledian.com. gc-portfolio may load many parcels and supports comparing them by a selected agknowledge product (e.g. ndvi or phenology start of season) both with a chart and a map.

## Integration
For the integration of the application you'll have to run the application with the provided init script `gc-portfolio-init.js` which cares of loading dependent libraries like Vue, Leaflet, etc. **This is the recommended way!**

Alternatively you have to add the dependencies in the head tag of the container website by yourself.
>Please ensure, that you load Vue.js (v.2.6.x) before loading the component first!
Also note that <a href="www.bulma.org">bulma.css</a> and <a href="www.fontawesome.org">Font awesome</a> wll be loaded through gc-portfolio.css.


```html
<html>
  <head>

    <!--GC component begin -->

    <!-- loads also dependent css files via @import -->
    <link href="css/gc-portfolio.css" rel="stylesheet">
    <!-- init script for components - note the id tag here! -->
    <script id="gc-portfolio-init" type="text/javascript" src="js/gc-portfolio-init.js" async></script>

    <!--GC component end -->
  </head>
```

Then you may create the widget(s) that build the whole application with custom HTML tags anywhere in the body section of the website. Make sure to use an unique identifier for each component. 

```html
<div id="gc-app">
  <gc-portfolio-map       
      gc-widget-id="map1" 
      :gc-apikey="$root.gcApikey" 
      :gc-host="$root.gcHost"
      gc-basemap="osm"
      gc-available-tools="productSelector,queryDateSelector,queryIndexValue,hints" 
      gc-available-products="ndvi,cire"
      :gc-selected-product="$root.selectedProduct"
      :gc-ph-startdate="$root.phStartdate"
      :gc-ph-enddate="$root.phEnddate"
      :gc-query-date="$root.queryDate"
      :gc-current-parcel-id="$root.selectedParcelId"
      :gc-selected-parcel-ids="$root.selectedParcelIds"
      :gc-parcels="$root.parcels"
      :gc-filter-string="$root.filterString"
      :gc-limit="$root.limit"
      :gc-offset="$root.offset"
      :gc-initial-loading="false"
      gc-available-options=""
      :gc-options-collapsed="true"
      :gc-language="$root.language">
  </gc-portfolio-map>

    <gc-chart 
      gc-widget-id="chart1"
        :gc-apikey="$root.gcApikey" 
        :gc-host="$root.gcHost"
        gc-mode="many-parcels"
        gc-available-products="ndvi,cire"
        :gc-selected-product="$root.selectedProduct"
        :gc-parcel-ids="$root.selectedParcelIds.join(',')"
        :gc-parcels="$root.parcels"
        :gc-zoom-startdate="$root.phStartdate"
        :gc-zoom-enddate="$root.phEnddate"
        :gc-selected-parcel-id="$root.selectedParcelId"
        :gc-options-collapsed="false"
        gc-available-options="dateZoom,legend"
        :gc-initial-loading="false"
        gc-datezoom-layout="horizontal"
        :gc-data-source="$root.selectedSource"
        :gc-language="$root.language"
        class="tile is-child">
    </gc-chart>
    
    <gc-list
      gc-widget-id="list1"
      :gc-parcels="$root.centroids"
      :gc-visible-parcel-ids="$root.visibleParcelIds.join(',')"
      :gc-selected-parcel-id="$root.selectedParcelId"
      :gc-language="$root.language"
      gc-field-analysis-link="file:///home/jsommer/dev/js/github/gc-analyst/index.html">
    </gc-list>
  
</div>
```

## Support
Please contact [us](mailto:info@geocledian.com) from geocledian.com if you have troubles using the application!

## Used Libraries
- [Vue.js](https://www.vuejs.org)
- [Vue I18n](https://kazupon.github.io/vue-i18n/)
- [c3.js](https://c3js.org/)
- [Leaflet](https://leafletjs.com/)
- [Leaflet Draw Plugin](http://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html)
- [Leaflet GeoSearch Plugin](https://github.com/smeijer/leaflet-geosearch)

## Legal: Terms of use from third party data providers
- You have to add the copyright information of the used data. At the time of writing the following text has to be visible for [Landsat](https://www.usgs.gov/information-policies-and-instructions/crediting-usgs) and [Sentinel](https://scihub.copernicus.eu/twiki/pub/SciHubWebPortal/TermsConditions/TC_Sentinel_Data_31072014.pdf) data:

```html
 contains Copernicus data 2020.
 U.S. Geological Service Landsat 8 used in compiling this information.
```

**geocledian is not responsible for illegal use of third party services.**
/*
 Vue.js Geocledian Portfolio analyst
 
 init script
 
 created:     2019-11-04, jsommer
 last update: 2020-12-15, jsommer
 version: 0.9.3
*/

// root Vue instance
var vmRoot;

// global gc locale object
// every component may append its data to this
var gcLocales = { en: {}, de: {} };

// global i18n object
var i18n;

// init dependent javascript libs
const libs = [
              'https://unpkg.com/vue@2.6.11/dist/vue.min.js',
              'https://unpkg.com/vue-i18n@8.17.5/dist/vue-i18n.js',
              // 'https://maps.googleapis.com/maps/api/js?key=YOUR_VALID_API_KEY_FROM_GOOGLE',
              'https://unpkg.com/leaflet@1.3.4/dist/leaflet.js',
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.2/leaflet.draw.js',
              // 'https://unpkg.com/leaflet.gridlayer.googlemutant@0.11.2/dist/Leaflet.GoogleMutant.js',
              'https://unpkg.com/leaflet-geosearch@3.1.0/dist/bundle.min.js',
              '../gc-chart/js/d3.v3.min.js', // v4.13.0 
              '../gc-chart/js/c3.min.js', // v0.7.11
              '../gc-portfolio-map/js/gc-portfolio-map.js',
              '../gc-portfolio-map/css/bulma-ext/bulma-calendar.min.js', // will be used in gc-chart also
              '../gc-chart/js/gc-chart.js',
              '../gc-filter/js/gc-filter.js',
              '../gc-list/js/gc-list.js',
            ];

function gcGetBaseURL() {
    //get the base URL relative to the current script - regardless from where it was called
    // js files are loaded relative to the page
    // css files are loaded relative to its file
    let scriptURL = document.getElementById("gc-portfolio-init");
    let url = new URL(scriptURL.src);
    let basename = url.pathname.substring(url.pathname.lastIndexOf('/')+1);
    return url.href.split('/js/'+basename)[0];
}

function loadJSscriptDeps(url_list, final_callback) {
    /* 
      loads dependent javascript libraries async but in order as given in the url_list. 
      thanks to 
      https://stackoverflow.com/questions/7718935/load-scripts-asynchronously
    */
    function scriptExists(url_to_check) {
      
      let found = false;

      for (var i=0; i< document.head.children.length; i++) {
        const script = document.head.children[i];
        
        // only scripts or links (css) are of interest
        if (!["SCRIPT","LINK"].includes(script.tagName))  { continue; }

        if (script.src === url_to_check) {
          found = true;
          //console.error("Script already loaded: "+ url_to_check)
          break;
        }
      }
      return found;
    }
    function loadNext() {
      //console.debug("length of URLs: "+ url_list.length);
      if (!url_list.length) { 
        console.debug("READY loading dependent libs"); 
        final_callback(); 
      }
  
      let url = url_list.shift();
      //console.debug("current URL: "+ url);

      if (url && !url.includes('http')) {
        url = gcGetBaseURL() + "/" +url;
        console.debug('loadNext()');
        console.debug(url);
      }

      // check google URL for valid key
      if (url && url.includes("YOUR_VALID_API_KEY_FROM_GOOGLE")) { 
        console.error("Change the Google Maps API Key!"); 
        return;
      }

      // prevent multiple loading of same script urls
      if (url && !scriptExists(url)) { 
        let script = document.createElement("script");  // create a script DOM node
        script.type = 'text/javascript';
        script.src = url;  // set its src to the provided URL
        script.async = true;
        // if ready, load the next on in queue
        script.onload = script.onreadystatechange = function () {
          loadNext();
        };
        // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
        document.head.appendChild(script); 
      }
      else { console.warn("URL already loaded - skipping: "+ url); }
    }
    //first call
    loadNext();

}
function initComponent() {
    /* 
      inits component
    */

    i18n = new VueI18n({
      locale: 'en', // set locale
      fallbackLocale: 'en',
      messages: gcLocales, // set locale messages
    })

    // bind index locales to global locales
    gcLocales.de.indexLocales = indexLocales.de;
    gcLocales.en.indexLocales = indexLocales.en;

    /* global vue root instance which controls the interaction between all components */
    vmRoot = new Vue({
        el: "#gc-app",
        data: {
          parcels: [],
          centroids: [],
          currentParcelId: -1,
          selectedParcelIds: [], //updated from map
          visibleParcelIds: [], //updated from map
          selectedProduct: "ndvi", //default preselected product is ndvi
          queryDate: new Date().simpleDate(), //today
          phStartdate: new Date(new Date().getUTCFullYear(), 2, 1).simpleDate(), // always 1st March current year
          phEnddate: new Date().simpleDate(), // now
          filterString: "",
          limit: 250,
          offset: 0,
          dataSource: "sentinel2",
          language: "de",
          proxy: undefined //"farmchamps.de/proxy" //"google.com" //adjust proxy here without http:// or https://
        },
        created() {
          console.debug("gc-portfolio-init created!");
          i18n.locale = this.language;
          //i18n for index page
          this.setLocaleForIndexPage();
        },
        mounted: function () {
          console.debug("root mounted!");

          //set up listener for changes from child components
          this.$on('filterStringChange', this.filterStringChange);
          this.$on('limitChange', this.limitChange);
          this.$on('offsetChange', this.offsetChange);
          this.$on('parcelsChange', this.parcelsChange);
          this.$on('currentParcelIdChange', this.currentParcelIdChange);
          this.$on('selectedParcelIdsChange', this.selectedParcelIdsChange);
          this.$on('selectedProductChange', this.selectedProductChange);
          this.$on('visibleParcelIdsChange', this.visibleParcelIdsChange);
          this.$on('queryDateChange', this.queryDateChange);
          this.$on('phStartdateChange', this.phStartdateChange);
          this.$on('phEnddateChange', this.phEnddateChange);
          // chart updates back to root
          this.$on('chartFromDateChange', this.phStartdateChange);
          this.$on('chartToDateChange', this.phEnddateChange);
          this.$on('dataSourceChange', this.dataSourceChange);
          
          //set apply filter per code
          this.$children[0].applyFilter();
        },
        watch: {
          parcels: function(newValue, oldValue) {
              console.debug("root parcels changed!");
              //console.debug(oldValue);
              //console.debug(newValue);
          },
          centroids: function(newValue, oldValue) {
              console.debug("root centroids changed!");
              //console.debug(oldValue);
              //console.debug(newValue);
          },
          filterString: function(newValue, oldValue) {
              console.debug("root filterString changed!");
              //console.debug(oldValue);
              //console.debug(newValue);
          },
          language (newValue, oldValue) {
            i18n.locale = newValue;
            //i18n for index page
            this.setLocaleForIndexPage();
          }
        },
        computed: {
          gcApikey: {
            // falls back to DEMO key if not set via URL ?key=kkk
            get: function() {
              return this.getQueryVariable(window.location.search.substring(1), "key");
            }
          },
          gcHost: {
            // falls back to geocledian.com if not set via URL &host=hhh
            get: function() {
              let host = this.getQueryVariable(window.location.search.substring(1), "host");
              return (host ? host : 'geocledian.com');
            }
          },
        },
        methods: {
          /* events for listening on child events */
          filterStringChange: function (filterString) {
              this.filterString = filterString;
          },
          limitChange: function (limit) {
              this.limit = limit;
          },
          offsetChange: function (offset) {
              this.offset = offset;
          },
          parcelsChange: function (parcels) {
              this.parcels = parcels;
              this.centroids = parcels;
          },
          centroidChange: function (centroids) {
              this.centroids = centroids;
          },
          currentParcelIdChange: function (value) {
              this.currentParcelId = value;
          },
          selectedParcelIdsChange: function (value) {
              this.selectedParcelIds = value;
          },
          selectedProductChange: function (product) {
              console.debug("root - selectedProduct setter - "+product);
              this.selectedProduct = product;
          },
          dataSourceChange: function (source) {
            this.dataSource = source;
          },
          visibleParcelIdsChange: function (visibleParcelIds) {
            this.visibleParcelIds = visibleParcelIds;
          },
          queryDateChange: function (value) {
            console.debug("root - queryDateChange()");
            this.queryDate = value;
          },
          phStartdateChange: function (phStartdate) {
              this.phStartdate = phStartdate;
          },
          phEnddateChange: function (phEnddate) {
              this.phEnddate = phEnddate;
          },
          //https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
          getQueryVariable: function (query, variable) {
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            console.log('Query variable %s not found', variable);
          },
          getAnalystsDashboardLink: function () {
            /* returns a dynamic link to the Analyst's Dashboard */

            let apiKey = "";
            let host = "";
            if (this.gcApikey) {
              apiKey = this.gcApikey;
            }
            if (this.gcHost) {
              host = this.gcHost;
            }
            return "https://geocledian.com/agclient/analyst/?key="+apiKey + "&host=" +host;
          },
          setLocaleForIndexPage() {
            try {
              document.getElementById("navbarProductOverview").innerHTML = i18n.t("indexLocales.navbar.productOverview")
              document.getElementById("navbarAboutUs").innerHTML = i18n.t("indexLocales.navbar.about");
              document.getElementById("allRightsReserved").innerHTML = i18n.t("indexLocales.footer.allRightsReserved");
              document.getElementById("menuMap").innerHTML = i18n.t("indexLocales.headings.map");
              document.getElementById("menuChart").innerHTML = i18n.t("indexLocales.headings.graph");
              document.getElementById("menuList").innerHTML = i18n.t("indexLocales.headings.list");
            } catch (ex) {
              console.warn("Could not set translation of index.html properly.");
              console.warn(ex);
            }
          }
        }
    });
}
function loadJSscript (url, callback) {
    /* 
      loads javascript library async and appends it to the DOM
      */
    let script = document.createElement("script");  // create a script DOM node
    script.type = 'text/javascript';
    script.src = gcGetBaseURL() + "/"+ url;  // set its src to the provided URL
    script.async = true;
    document.head.appendChild(script);  // add it to the end of the head section of the page
    //if ready, call the callback function 
    script.onload = script.onreadystatechanged = function () {
      if (callback) { callback(); }
    };
}

// async loading dependencies and init the component
loadJSscriptDeps(libs, initComponent);   


Date.prototype.simpleDate = function () {
  var a = this.getFullYear(),
      b = this.getMonth() + 1,
      c = this.getDate();
  return a + "-" + (1 === b.toString().length ? "0" + b : b) + "-" + (1 === c.toString().length ? "0" + c : c)
}
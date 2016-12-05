import {SERVICES} from '../services/services';

const constants = {
           SENTIMENT_JSON_MAPPING : {
                "0": -5,
                "-1": -15,
                "1": 5
           },
           TIMESPAN_TYPES : {
                'hours': {
                    format: "MM/DD/YYYY HH:00", blobFormat: "[hour]-YYYY-MM-DDHH:00", rangeFormat: "hour"
                },
                'days': {
                    format: "MM/DD/YYYY", blobFormat: "[day]-YYYY-MM-DD", rangeFormat: "day"
                },
                'months': {
                    format: "YYYY-MM", blobFormat: "[month]-YYYY-MM", rangeFormat: "month"
                },
                'weeks': {
                    format: "YYYY-WW", blobFormat: "[week]-YYYY-WW", rangeFormat: "isoweek"
                },
                'customDate': {
                    format: "MM/DD/YYYY", reactWidgetFormat: "MMM Do YYYY", blobFormat: "[day]-YYYY-MM-DD", rangeFormat: "day"
                },
                'customDateTime': {
                    format: "MM/DD/YY HH:00", reactWidgetFormat: "MMM Do YYYY HH:00", blobFormat: "[hour]-YYYY-MM-DDHH:00", rangeFormat: "hour"
                },
                'customMonth': {
                    format: "MMMM YYYY", reactWidgetFormat: "MMMM YYYY", blobFormat: "[month]-YYYY-MM", rangeFormat: "month"
                }
           },
           DATA_SOURCES: new Map([["all", {"display": "All", "sourceValues":[], "icon": "fa fa-share-alt", "label": "All"}], 
                            ["facebook", {"display": "Facebook", "sourceValues":["facebook-messages", "facebook-comments"], "icon": "fa fa-facebook-official", "label": ""}], 
                            ["twitter", {"display": "Twitter", "sourceValues":["twitter"], "label": "", "icon": "fa fa-twitter"}], 
                            ["acled", {"display": "acled", "sourceValues":["acled"], "label": "", "icon": "fa fa-font"}],
                            ["tadaweb", {"display": "Tadaweb", "sourceValues":["tadaweb"], "label": "", "icon": "fa fa-text-width"}]
                          ]),
           MOMENT_FORMATS: {
               "timeScaleDate": "MM/DD/YY HH:00"
           },
           SENTIMENT_COLOR_MAPPING : {
               "negative": "red",
               "neutral": "yellow",
               "positive": "green"
           },
           EVENT_SOURCE_ICON_MAP : {
               "twitter": "fa fa-twitter",
               "facebook": "fa fa-facebook-official"
           },
           CATEGORY_KEY_MAPPING: {
             'kw': 'keyword',
             'g': 'group',
             'sec': 'sector',
             'st': 'status'
           },
           DASHBOARD : {
               CHANGE_SEARCH: "SEARCH:CHANGE",
               CHANGE_DATE: "DATE:CHANGE",
               INITIALIZE: "INIT",
               CHANGE_SOURCE: "UPDATE:DATA_SOURCE",
               CHANGE_COLOR_MAP: "UPDATE:COLOR_MAP",               
               ASSOCIATED_TERMS: "UPDATE:ASSOCIATED_TERMS",
               CHANGE_TERM_FILTERS: "UPDATE:CHANGE_TERM_FILTERS"
           },
           FACTS : {
               LOAD_FACTS: "LOAD:FACTS",
               LOAD_FACTS_SUCCESS: "LOAD:FACTS_SUCCESS",
               LOAD_FACTS_FAIL: "LOAD:FACTS_FAIL",
               SAVE_PAGE_STATE: "SAVE:PAGE_STATE",
               LOAD_FACT: "LOAD:FACT"
           },
           ADMIN : {
               LOAD_KEYWORDS: "LOAD:KEYWORDS",
               LOAD_SETTINGS: "LOAD:SETTINGS",
               SAVE_SETTINGS: "SAVE:SETTINGS",
               CREATE_SITE: "CREATE:SITE",
               LOAD_FB_PAGES: "LOAD:FB_PAGES",
               LOAD_LOCALITIES: "LOAD:LOCALITIES",
               GET_LANGUAGE: "GET:LANGUAGE",
               GET_TARGET_REGION: "GET:TARGET_REGION",
               LOAD_FAIL: "LOAD:FAIL",
           },
};

const DataSources = source => constants.DATA_SOURCES.has(source) ? constants.DATA_SOURCES.get(source).sourceValues : undefined;
const DataSourceLookup = requestedSource => {
    // eslint-disable-next-line
    for (let [source, value] of constants.DATA_SOURCES.entries()) {
        if(value.sourceValues.indexOf(requestedSource) > -1){
            return value;
        }
    }

    return undefined;
};

const methods = {
    DASHBOARD: {
        changeSearchFilter(selectedEntity, siteKey, colorMap){
           let self = this;

           self.dispatch(constants.DASHBOARD.CHANGE_SEARCH, {selectedEntity, colorMap});
        },
        initializeDashboard(siteId){
            let self = this;

            SERVICES.getSiteDefintion(siteId, false, (error, response, body) => {
                if(!error && response.statusCode === 200 && body.data && body.data.siteDefinition.sites) {
                    const siteSettings = body.data.siteDefinition.sites[0];
                    self.dispatch(constants.DASHBOARD.INITIALIZE, siteSettings);
                    
                }else{
                    console.error(`[${error}] occured while processing message request`);
                }
            });
        },
        termsColorMap(colorMap){
            this.dispatch(constants.DASHBOARD.CHANGE_COLOR_MAP, {colorMap})
        },
        changeTermsFilter(newFilters){
           this.dispatch(constants.DASHBOARD.CHANGE_TERM_FILTERS, newFilters);
        },
        filterDataSource(dataSource){
           this.dispatch(constants.DASHBOARD.CHANGE_SOURCE, dataSource);
        },
        updateAssociatedTerms(associatedKeywords, bbox){
            this.dispatch(constants.DASHBOARD.ASSOCIATED_TERMS, {associatedKeywords, bbox});
        },
        changeDate(siteKey, datetimeSelection, timespanType){
           this.dispatch(constants.DASHBOARD.CHANGE_DATE, {datetimeSelection: datetimeSelection, timespanType: timespanType});
        },

    },
    FACTS: {
        load_facts: function (pageSize, skip) {
            let self = this;
            let dataStore = this.flux.stores.FactsStore.dataStore;
            if (!dataStore.loading) {
                this.dispatch(constants.FACTS.LOAD_FACTS);
                SERVICES.getFacts(pageSize, skip)
                    .subscribe(response => {
                        self.dispatch(constants.FACTS.LOAD_FACTS_SUCCESS, { response: response });
                    }, error => {
                        console.warning('Error, could not load facts', error);
                        self.dispatch(constants.FACTS.LOAD_FACTS_FAIL, { error: error });
                    });
            }
        },
        save_page_state: function(pageState) {
            this.dispatch(constants.FACTS.SAVE_PAGE_STATE, pageState);
        },
        load_fact: function (id) {
            let self = this;
            let dataStore = this.flux.stores.FactsStore.dataStore;

            dataStore.factDetail = null;

            if (!dataStore.factDetail) {
                SERVICES.getFact(id)
                    .subscribe(response => {
                        self.dispatch(constants.FACTS.LOAD_FACT, { response: response });
                    }, error => {
                        console.warning('Error, could not load fact id: ' + id, error);
                    });
            }
        }
    },
    ADMIN: {
        load_settings: function(siteName){
            let self = this;
            const LOAD_SITE_LIST = true;

            SERVICES.getSiteDefintion(siteName, LOAD_SITE_LIST, (error, response, body) => {
                    if(!error && response.statusCode === 200 && body.data && body.data.siteDefinition) {
                        const settings = body.data.siteDefinition.sites;
                        if(settings && settings.length > 0){
                            const action = false;
                            self.dispatch(constants.ADMIN.LOAD_SETTINGS, {settings: settings[0], 
                                                                          action: action, 
                                                                          originalSiteName: siteName, 
                                                                          siteList: body.data.siteList.sites});
                        }else{
                            console.error(`site [${siteName}] does not exist.`);
                        }
                    }else{
                        console.error(`[${error}] occured while processing message request`);
                    }
            });
        },
        save_settings: function(siteName, modifiedSettings){
            let self = this;

            SERVICES.createOrReplaceSite(siteName, modifiedSettings, (error, response, body) => {
                if(!error && response.statusCode === 200 && body.data && body.data.createOrReplaceSite) {
                    const action = 'Saved';
                    let mutatedSettings = Object.assign({}, {name: modifiedSettings.name}, {properties: modifiedSettings});
                    delete mutatedSettings.properties.name;

                    self.dispatch(constants.ADMIN.LOAD_SETTINGS, {settings: mutatedSettings, 
                                                                  originalSiteName: siteName, 
                                                                  action: action});
                }else{
                    console.error(`[${error}] occured while processing message request`);
                }
            });
        },
        create_site: function(siteName, modifiedSettings){
            let self = this;

            SERVICES.createOrReplaceSite(siteName, modifiedSettings, (error, response, body) => {
                if(!error && response.statusCode === 200 && body.data && body.data.createOrReplaceSite) {
                    const action = 'Saved';
                    self.dispatch(constants.ADMIN.CREATE_SITE, {siteName, action});
                }else{
                    console.error(`[${error}] occured while processing message request`);
                }
            });
        },
        load_keywords: function (siteId, languages) {
            let self = this;
            const edgeType = "Term";
            let dataStore = this.flux.stores.AdminStore.dataStore;
            if (!dataStore.loading) {
                SERVICES.fetchEdges(siteId, "en", edgeType, (error, response, body) => {
                        if (!error && response.statusCode === 200) {
                            const response = body.data.terms.edges.map(term=>{
                                  let termData = {"name": term.name};
                                  languages.forEach(lang=>{
                                      if(lang !== "en"){
                                          termData[`name_${lang}`] = term[`name_${lang}`];
                                      }
                                  });
                                  return termData;
                            });
                            self.dispatch(constants.ADMIN.LOAD_KEYWORDS, response);
                        }else{
                            let error = 'Error, could not load keywords for admin page';
                            self.dispatch(constants.ADMIN.LOAD_FAIL, { error });
                        }
                });
            }
        },

        load_localities: function () {
            let self = this;
            const edgeType = "Location";
            let dataStore = this.flux.stores.AdminStore.dataStore;
            if (!dataStore.loading) {
                SERVICES.fetchEdges("ocha", "en", edgeType, (error, response, body) => {
                        if (!error && response.statusCode === 200) {
                            const response = body.data.locations.edges.map(location=>{
                                  return Object.assign({}, {"name": location.name, "coordinates": location.coordinates.join(",")});
                            });
                            self.dispatch(constants.ADMIN.LOAD_LOCALITIES, { localities: response});
                        }else{
                            let error = 'Error, could not load keywords for admin page';
                            self.dispatch(constants.ADMIN.LOAD_FAIL, { error });
                        }
                });
            }
        },

        load_fb_pages: function () {
            let self = this;
            let dataStore = this.flux.stores.AdminStore.dataStore;
            if (!dataStore.loading) {
                SERVICES.getAdminFbPages()
                    .subscribe(response => {
                        self.dispatch(constants.ADMIN.LOAD_FB_PAGES, { fbPages: response });
                    }, error => {
                        console.warning('Error, could not load facts', error);
                        self.dispatch(constants.ADMIN.LOAD_FAIL, { error: error });
                    });
            }
        },

         get_language: function () {
            let self = this;
            let dataStore = this.flux.stores.AdminStore.dataStore;
            if (!dataStore.loading) {
                SERVICES.getAdminLanguage()
                    .subscribe(response => {
                        self.dispatch(constants.ADMIN.GET_LANGUAGE, { language: response });
                    }, error => {
                        console.warning('Error, could not load facts', error);
                        self.dispatch(constants.FACTS.LOAD_FAIL, { error: error });
                    });
            }
        },

        get_target_region: function () {
            let self = this;
            let dataStore = this.flux.stores.AdminStore.dataStore;
            if (!dataStore.loading) {
                SERVICES.getAdminTargetRegion()
                    .subscribe(response => {
                        self.dispatch(constants.ADMIN.GET_TARGET_REGION, { targetRegion: response });
                    }, error => {
                        console.warning('Error, could not load facts', error);
                        self.dispatch(constants.ADMIN.LOAD_FAIL, { error: error });
                    });
            }
        }
    }
};

export const Actions = {
  constants: constants,
  methods: methods,
  DataSources: DataSources,
  DataSourceLookup
};

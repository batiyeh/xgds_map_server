# __BEGIN_LICENSE__
#Copyright (c) 2015, United States Government, as represented by the 
#Administrator of the National Aeronautics and Space Administration. 
#All rights reserved.
#
#The xGDS platform is licensed under the Apache License, Version 2.0 
#(the "License"); you may not use this file except in compliance with the License. 
#You may obtain a copy of the License at 
#http://www.apache.org/licenses/LICENSE-2.0.
#
#Unless required by applicable law or agreed to in writing, software distributed 
#under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
#CONDITIONS OF ANY KIND, either express or implied. See the License for the 
#specific language governing permissions and limitations under the License.
# __END_LICENSE__

XGDS_MAP_SERVER_MEDIA_SUBDIR = 'xgds_map_server/'
XGDS_MAP_SERVER_DATA_SUBDIR = 'xgds_map_server/'
XGDS_MAP_SERVER_GEOTIFF_SUBDIR = XGDS_MAP_SERVER_DATA_SUBDIR + 'geoTiff/'

XGDS_MAP_SERVER_TEMPLATE_DEBUG = True  # If this is true, handlebars templates will not be cached.

XGDS_MAP_SERVER_OVERLAY_IMAGES_DIR = XGDS_MAP_SERVER_DATA_SUBDIR + "MapOverlayImages"

XGDS_MAP_SERVER_TOP_LEVEL = {
    "name": "xGDS Maps",
    "description": "Top level KML feed for xGDS maps.",
    "filename": "xgds.kml"
}

# kml root from xgds_map_server
XGDS_MAP_SERVER_LAYER_FEED_URL = "/xgds_map_server/treejson/"

# path to script to turn geotiffs into tiles, via gdal with our patch
XGDS_MAP_SERVER_GDAL2TILES = "/xgds_map_server/bin/gdal2tiles.py"


# A list of regex strings. If the name of a Map object matches one of
# the regexes (using re.search), the Map is considered to be a logo. (If
# the map feed is requested with the URL parameter 'logo=0', logo Maps
# have visibility turned off.)
XGDS_MAP_SERVER_LOGO_PATTERNS = []

# include this in your siteSettings.py BOWER_INSTALLED_APPS
XGDS_MAP_SERVER_BOWER_INSTALLED_APPS = ('backbone#1.1.2',
                                        'marionette',
                                        'backbone-relational',
                                        'backbone-forms',
                                        'fancytree',
                                        'ol3',
                                        'ol3-popup'
                                        )

# if you want to have a custom javascript included in your maps, override this in siteSettings.
# for example:
#    XGDS_MAP_SERVER_PIPELINE_JS = {'custom_map': {'source_filenames': ('plrpExplorer/js/bathymetry.js'),
#                                                 'output_filename': 'js/custom_map_js.js',
#                                                 }
#                               }
# IMPORTANT: we are expecting something named custom_map so don't rename it.
# and then include it in PIPELINE_JS ie
# PIPELINE_JS.update(XGDS_MAP_SERVER_PIPELINE_JS)
XGDS_MAP_SERVER_PIPELINE_JS = {'custom_map': {'source_filenames': ('xgds_map_server/js/custom_map.js'),
                                              'output_filename': 'js/custom_map.js',
                                              }
                               }

# XGDS_MAP_SERVER_MAP_LOADED_CALLBACK: The fully qualified name of an
# extra JavaScript callback to call after the map is loaded.
XGDS_MAP_SERVER_MAP_LOADED_CALLBACK = 'null'

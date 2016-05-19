#__BEGIN_LICENSE__
# Copyright (c) 2015, United States Government, as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All rights reserved.
#
# The xGDS platform is licensed under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# http://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#__END_LICENSE__

import django.views.static
from django.conf.urls import url  # pylint: disable=W0401
from django.contrib.auth.decorators import login_required

from django.conf import settings
from resumable.views import ResumableUploadView

from xgds_map_server import views

urlpatterns = [url(r'^$', views.getMapServerIndexPage,
                   {'readOnly': True, 'securityTags': ['readOnly']},
                   'xgds_map_server_index'),
               url(r'^$', views.getMapServerIndexPage,
                   {'readOnly': True, 'securityTags': ['readOnly']},
                   'map'),
    url(r'^feedPage/', views.getGoogleEarthFeedPage,
     {'readOnly': True, 'securityTags': ['readOnly']},
     'xgds_map_server_feed'),
    # Map server urls
    # HTML list of maps with description and links to individual maps, and a link to the kml feed
    # url(r'^list/', views.getMapListPage,
    # {'readOnly': True, 'securityTags': ['readOnly']},
    # 'mapList'),
    # for saving single map feature from map layer, or creating new one
    url(r'^feature$', views.saveOrDeleteFeature, {}, 'saveOrDeleteFeature'),
    url(r'^feature/(?P<uuid>[\w-]+)$', views.saveOrDeleteFeature, {}, 
     'saveOrDeleteFeature'),
    # for saving map layer itself
    url(r'^saveMaplayer.json$', views.saveMaplayer, {}, 'saveMaplayer'),
    # HTML tree of maps
    url(r'^maptree/', views.getMapTreePage,
     {'readOnly': True, 'securityTags': ['readOnly']},
     'mapTree'),
    # Open Map Editor on a map layer
    url(r'^mapeditor/(?P<layerID>[\w-]+)/', views.getMapEditorPage, {}, 'mapEditLayer'),
    url(r'^maplayer/kml/(?P<layerID>[\w-]+)/', views.getMapLayerKML,{},'mapLayerKML'),
    # JSON tree of maps, formatted for jstree
#     url(r'^listjson/', views.getMapTreeJSON,
#      {'readOnly': True, 'loginRequired': False, 'securityTags': ['readOnly']},
#      'mapListJSON'),
    url(r'^treejson/', views.getFancyTreeJSON, {'readOnly': True, 'loginRequired': False, 'securityTags': ['readOnly']}, 'mapTreeJSON'),
    url(r'^selectedjson/', views.getSelectedNodesJSON, {'readOnly': True, 'loginRequired': False, 'securityTags': ['readOnly']}, 'mapSelectedJSON'),
    url(r'^mapLayerJSON/(?P<layerID>[\w-]+)/', views.getMapLayerJSON, {'readOnly': True, 'loginRequired': False, 'securityTags': ['readOnly']}, 'mapLayerJSON'),
    # HTML detail view of map
    url(r'^detail/(?P<mapID>[\w-]+)/', views.getMapDetailPage,
     {'readOnly': True },
     'mapDetail'),
    # HTML detail of a folder (group)
    url(r'^folderDetail/(?P<groupID>[\w-]+)/', views.getFolderDetailPage, {'readOnly': True}, 'folderDetail'),
    # HTML view to delete a folder (group)
    url(r'^folderDelete/(?P<groupID>[\w-]+)/', views.getDeleteFolderPage, {}, 'folderDelete'),
    # HTML view to add a folder (group)
    url(r'^folderAdd/', views.getAddFolderPage, {}, 'folderAdd'),
    # HTML view to add new map
    url(r'^addkml/', views.getAddKmlPage, {}, 'addKml'),
    url(r'^addlayer/', views.getAddLayerPage, {}, 'mapAddLayer'),
    url(r'^addTile/', views.getAddTilePage, {}, 'mapAddTile'),
    url(r'^editTile/(?P<tileID>[\w-]+)/', views.getEditTilePage, {}, 'mapEditTile'),
    url(r'^addMapSearch/', views.getAddMapSearchPage, {}, 'mapAddMapSearch'),
    url(r'^editMapSearch/(?P<mapSearchID>[\w-]+)/', views.getEditMapSearchPage, {}, 'mapEditMapSearch'),
    url(r'^addMapCollection/', views.getAddMapCollectionPage, {}, 'mapAddMapCollection'),
    url(r'^editMapCollection/(?P<mapCollectionID>[\w-]+)/', views.getEditMapCollectionPage, {}, 'mapEditMapCollection'),
    url(r'^mapCollectionJSON/(?P<mapCollectionID>[\w-]+)/', views.getMapCollectionJSON, {'readOnly': True, 'loginRequired': False, 'securityTags': ['readOnly']}, 'mapCollectionJSON'),
    url(r'^mapSearchJSON/(?P<mapSearchID>[\w-]+)/', views.getMapSearchJSON, {'readOnly': True, 'loginRequired': False, 'securityTags': ['readOnly']}, 'mapSearchJSON'),
    url(r'^doMapSearch/', views.searchWithinMap, {}, 'doMapSearch'),
    url(r'^saveMapSearch/', views.saveSearchWithinMap, {}, 'saveMapSearch'),

    # HTML view to confirm deletion of view
    url(r'^delete/(?P<nodeID>[\w-]+)/', views.getDeleteNodePage, {}, 'nodeDelete'),
    # List of deleted maps that can be un-deleted
    url(r'^deleted/', views.getDeletedNodesPage, {'readOnly': True}, 'deletedNodes'),
    # JSON-accepting url that moves maps/folders around
    url(r'^moveNode', views.moveNode, {}, 'moveNode'),
    # JSON-accepting url that changes visibility for a node
    url(r'^setNodeVisibility', views.setNodeVisibility, {}, 'setNodeVisibility'),

    # --- this url is deprecated, don't use it in new code ---
    # This URL should receive a static files
    url(r'^data/(?P<path>.*)$', django.views.static.serve,
     {'document_root': settings.DATA_URL + settings.XGDS_MAP_SERVER_DATA_SUBDIR,
      'show_indexes': True,
      'readOnly': True},
     'xgds_map_server_static'),

    # By default if you just load the app you should see the list
    url(r'^feed/(?P<feedname>.*)', views.getMapFeed,
     {'readOnly': True, 'loginRequired': False, 'securityTags': ['kml', 'readOnly']},'xgds_map_server_feed'),
    url(r'^uploadGeoTiff/$', login_required(ResumableUploadView.as_view()), name='uploadGeoTiff'),
    url(r'^fmapJson/(?P<object_name>[\w]+[\.]*[\w]*)/(?P<filter>[\w]+:[\w]+)$', views.getMappedObjectsJson, {'isLive':settings.GEOCAM_UTIL_LIVE_MODE, 'force':True}, 'xgds_map_server_objectsJson_force'),
    url(r'^mapJson/(?P<object_name>[\w]+[\.]*[\w]*)/(?P<filter>[\w]+:[\w]+)$', views.getMappedObjectsJson, {'isLive':settings.GEOCAM_UTIL_LIVE_MODE}, 'xgds_map_server_objectsJson'),
    url(r'^mapJson/(?P<object_name>[\w]+[\.]*[\w]*)/(?P<range>[\d]+)$', views.getMappedObjectsJson, {'isLive':settings.GEOCAM_UTIL_LIVE_MODE}, 'xgds_map_server_objectsJson_range'),
    url(r'^mapJson/(?P<object_name>[\w]+[\.]*[\w]*)$', views.getMappedObjectsJson, {'range':0, 'force': True, 'isLive':settings.GEOCAM_UTIL_LIVE_MODE}, 'xgds_map_server_objectsJson_default'),
    
    url(r'^search/$', views.getSearchPage, {}, 'search_map'),
    url(r'^search/(?P<modelName>[\w]+)$', views.getSearchPage, {}, 'search_map_object'),
    url(r'^view/(?P<modelName>[\w]+)/(?P<modelPK>[\d]+)$', views.getViewSingleModelPage, {}, 'search_map_single_object'),

]

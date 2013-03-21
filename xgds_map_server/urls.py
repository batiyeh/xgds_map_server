# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import *  # pylint: disable=W0401

from xgds_map_server import settings
from xgds_map_server import views

urlpatterns = patterns(
    '',

    (r'^$', views.getMapListPage,
     {'readOnly': True, 'securityTags': ['readOnly']},
     'xgds_map_server_index'),
    # Map server urls
    # HTML list of maps with description and links to individual maps, and a link to the kml feed
    (r'^list/', views.getMapListPage,
     {'readOnly': True, 'securityTags': ['readOnly']},
     'mapList'),
    # HTML tree of maps
    (r'^listtree/', views.getMapTreePage,
     {'readOnly': True, 'securityTags': ['readOnly']},
     'mapTree'),
    # JSON tree of maps, formatted for jstree
    (r'^listjson/', views.getMapTreeJSON,
     {'readOnly': True, 'securityTags': ['readOnly']},
     'mapListJSON'),
    # HTML detail view of map
    (r'^detail/(?P<mapID>\d+)/', views.getMapDetailPage,
     {'readOnly': True},
     'mapDetail'),
    # HTML view to add new map
    (r'^add/', views.getAddMapPage,
     {'readOnly': True},
     'addMap'),
    # HTML view to confirm deletion of view
    (r'^delete/(?P<mapID>\d+)/', views.getDeleteMapPage,
     {'readOnly': True},
     'mapDelete'),
    # This URL should receive a static files
    (r'^data/(?P<path>.*)$', 'django.views.static.serve',
     {'document_root': settings.DATA_URL + settings.XGDS_MAP_SERVER_DATA_SUBDIR,
      'show_indexes': True,
      'readOnly': True},
     'xgds_map_server_static'),
    # By default if you just load the app you should see the list
    (r'^feed/(?P<feedname>.*)', views.getMapFeed,
     {'readOnly': True, 'loginRequired': False, 'securityTags': ['kml', 'readOnly']},
     'xgds_map_server_feed'),
)

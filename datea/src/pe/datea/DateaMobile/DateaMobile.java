/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
<<<<<<< HEAD:datea/res/xml/cordova.xml
-->
<cordova>
	<!--  
	access elements control the Android whitelist.  
	Domains are assumed blocked unless set otherwise
	 -->

    <access origin="http://127.0.0.1*"/> <!-- allow local pages -->
    <access origin="http://127.0.0.1:8000*"/>
    <access origin="http://192.168.2.113:8000*"/>

	<!-- <access origin="https://example.com" /> allow any secure requests to example.com -->
	<!-- <access origin="https://example.com" subdomains="true" /> such as above, but including subdomains, such as www -->
	<!-- <access origin=".*"/> Allow all domains, suggested development use only -->

    <log level="DEBUG"/>
    <preference name="classicRender" value="true" />
</cordova>


=======
 */


package pe.datea.DateaMobile;

import android.app.Activity;
import android.os.Bundle;
import org.apache.cordova.*;

public class DateaMobile extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}

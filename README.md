# R-Collections API

1. [Dependencies](#dependencies)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Local Isolated Testing](#4-local-isolated-testing)
	1. [XSLT testing](#1-xslt-testing)

## Dependencies

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. [NodeJS](https://nodejs.org/en)

## Architecture

The best way to view this image is to download it and re-open in the browser

![MDC-architecture drawio (5)](https://github.com/shenuka-jayasinghe/rc-api/assets/137282472/e0f6ae02-2ed2-4f62-bea4-77ab79114ee5)


### Architecture running in Argo

[Screencast from 19-04-24 16:13:11.webm](https://github.com/shenuka-jayasinghe/rc-api/assets/137282472/4a88921b-e44f-4e82-9f17-10f4e1cf2b3e)



## Setup


1. [Setup your Kubernetes and Kafka Cluster](#1-setup-your-kubernetes-and-kafka-cluster)

	1. [Activate Kubernetes](#1-activate-kubernetes)
	2. [Run NGINX Ingress Controller](#2-run-nginx-ingress-controller)
	3. [Run Kubernetes Cluster using ArgoCD](#3-run-the-kubernetes-cluster-using-argocd)
	4. [Chec Kafka Topics have been created](#4-check-that-kafka-topics-have-been-created)
	5. [Setup KSQL for SQL queries](#5-setup-ksqldb-for-sql-queries)
	6. [Activate tei2json service](#6-activate-the-tei2json-service)
	7. [Seed your Kafka Cluster](#7-seed-your-kafka-cluster)

2. [REST API](#2-rest-api)
3. [Example Data](#3-example-data)

The images now run on a Kubernetes cluster. If you still prefer to use Docker compose, they are in the ```depracated``` directory.

## 1. Setup your Kubernetes and Kafka Cluster

### 1. Activate Kubernetes


Enable Kubernetes using [Docker Desktop](https://www.docker.com/products/docker-desktop/)

![Screenshot from 2024-04-12 22-37-31](https://github.com/shenuka-jayasinghe/rc-api/assets/137282472/774b45db-6182-4b33-a146-211c39302ad9)


### 2. Run NGINX Ingress Controller

1. Make sure localhost port 80 is free

Go to http://localhost:80 and check that there is no reverse proxy like NGINX or Apache2 running. You can double check by running the following in the terminal:

```bash
sudo lsof -i :80
```

If Apache server is running, try:
```
sudo systemctl stop apache2
```

If NGINX server is running, try:
```
sudo systemctl stop nginx
```
Go to http://localhost:80 and doublecheck that nothing is running, as this port will be necessary to run the ingress-controller.

Once port 80 is free run the following in the terminal:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

Watch the pods until the ingress-controller is running
```bash
kubectl get pods --namespace ingress-nginx -w
```
![Screenshot from 2024-04-19 15-10-08](https://github.com/shenuka-jayasinghe/rc-api/assets/137282472/a8d126f8-c820-402f-845f-b9296070b6c9)


### 3. Run the Kubernetes Cluster using ArgoCD

1. Run ArgoCD with these three steps below in the terminal

Create a namespace for Argo in Kubernetes.

```bash
kubectl create namespace argocd
```
Install argo in that namespace

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
Run Argo

```
kubectl port-forward svc/argocd-server -n argocd 8083:443
```

Open your browser to http://localhost:8083. 

> Your browser will warn you not to proceed because it is not a https connection, but you can proceed as it is only in your local machine and not a website.

You will then come to a login page.

Username: ```admin```

Password: ```INSTRUCTIONS BELOW```

Open a new terminal and run this to get the password:
```
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Click on ```Create Application``` and then ```Edit as YAML``` and paste in this following YAML:

```YAML
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: rc-api
spec:
  destination:
    name: ''
    namespace: default
    server: 'https://kubernetes.default.svc'
  source:
    path: kubernetes
    repoURL: 'https://github.com/shenuka-jayasinghe/rc-api.git'
    targetRevision: HEAD
  sources: []
  project: default
  syncPolicy:
    automated:
      prune: false
      selfHeal: false
```

and then click ```SAVE``` then ```CREATE```

The Kubernetes cluster should run automatically and connect this github repository

2. Reconfigure hosts 

Run this in terminal:
```bash
sudo nano /etc/hosts
```

add ``kafka`` as one of the names for 127.0.0.1

```bash
127.0.0.1       kafka
127.0.0.1       localhost
```
### 4. Check that Kafka topics have been created

Check that the following topics have been created

	1. json-topic
	2. tei-topic
	3. narratives-topic
	4. collections-topic
	5. mapping-topic
	6. tei-template-topic

You can check by

1. Finding the Kafka pod
```bash
kubectl get pods
```

2. List topics
```bash
kubectl exec -it [KAFKA-POD-NAME] -- kafka-topics.sh --list --bootstrap-server localhost:9092
```
If all topics are present, proceed the next step. If not make sure to create all topics

```bash
kubectl exec -it [KAFKA-POD-NAME] -- kafka-topics.sh --create --topic [TOPIC-NAME] --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
```
for example

```bash
kubectl exec -it kafka-7756d6c55d-xdqhc -- kafka-topics.sh --create --topic narratives-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
```

### 5. Setup KSQLDB for SQL queries

Find your KSQLDB-CLI pod name
```bash
kubectl get pods
```

and shell into the KSQLDB-CLI pod

```bash
kubectl exec -it [KSQLDB-CLI-POD-NAME] -- ksql http://ksqldb-server:8088
```
Once you entered KSQLDB-CLI, run the following SQL command:
```SQL
CREATE STREAM collection_stream (
    event VARCHAR,
    title VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='collections-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM tei_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    tei VARCHAR
) WITH (
    KAFKA_TOPIC='tei-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM tei_template_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    tei_template VARCHAR
) WITH (
    KAFKA_TOPIC='tei-template-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM json_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='json-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM mapping_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='mapping-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM narratives_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='narratives-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM monitor_stream (
    id VARCHAR,
    kafka_topic VARCHAR,
    event VARCHAR,
    timestamp BIGINT,
    partition VARCHAR
) WITH (
    KAFKA_TOPIC='monitor-topic',
    VALUE_FORMAT='JSON'
);
```

### 6. Activate the TEI2JSON service

Find your ```tei2json-api``` pod name
```bash
kubectl get pods
```
Then run:
```bash
kubectl exec -it [tei2json-api-PODNAME] -- docker run shenukacj/cudl-xslt:0.0.5
```
```bash
kubectl exec -it [tei2json-api-PODNAME] -- node app.js
```

### 7. Seed your Kafka cluster

Run the seed function, ```node seed.js``` that is inside the data directory

```bash
rc-api/data$ node seed.js
```
===================================================<br>
Your local Kubernetes and Kafka cluster is now ready
===================================================<br>

### 2. REST API

You can test the REST API with ```PR-CHCR-00023``` for the ```:id``` parameter. 

Working endpoints:

| Microservice | Request | Body format | Data | Port | Endpoint |
|-------------|---------|-------------|------|------|----------|
| Monitor | ```get``` <br> ```get``` | |  | 3007 | http://localhost/api/v1/monitor/[:id]  <br> http://localhost/api/v1/monitor/last/[:id] |
| Narratives | ```get```| JSON |  | 3006 | http://localhost/api/v1/narratives/allEvents/[:IRN] |
| Narratives | ```post``` <br> ```put``` <br> ```delete``` <br> ```get```| JSON |  | 3006 | http://localhost/api/v1/narratives/[:IRN] |
| Mapping | ```get```| JSON |  | 3005 | http://localhost/api/v1/mapping/allEvents/[:IRN] |
| Mapping | ```post``` <br> ```put``` <br> ```delete``` <br> ```get```| JSON |  | 3005 | http://localhost/api/v1/mapping/[:IRN] |
| TEI Template | ```get```| XML |  | 3004 | http://localhost/api/v1/tei/template/allEvents/[:IRN] |
| TEI Template | ```post``` <br> ```put``` <br> ```delete``` <br> ```get```| XML |  | 3004 | http://localhost/api/v1/tei/template/[:IRN] |
| Collections | ```get```| JSON |  | 3003 | http://localhost/api/v1/collections/allEvents/[:title] |
| Collections | ```post``` <br> ```put``` <br> ```delete``` <br> ```get```| JSON |  | 3003 | http://localhost/api/v1/collections/[:title] |
| TEI to JSON | ```post```| XML | [TEI Example](#tei-example)| 3001 | http://localhost/api/v1/tei2json/cudl-xslt/[:id]|
| Item JSON | ```post``` <br> ```put``` <br> ```delete``` <br> ```get```| JSON | [JSON Example](#json-example-data) | 3002 | http://localhost/api/v1/json/[:id] |
| Item JSON | ```get```| JSON |  | 3002 | http://localhost/api/v1/json/allEvents/[:id] |
| Item TEI | ```post``` <br> ```put``` <br> ```delete``` <br> ```get```| XML | [TEI Example](#tei-example) | 3000 | http://localhost/api/v1/tei/[:id] |
| Item TEI | ```get```| XML | | 3000 | http://localhost/api/v1/tei/allEvents/[:id] |


## 3. Example Data

### TEI Example
```xml
<?xml version="1.0"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>Chinese Crawford 23</title>
                <respStmt>
                    <resp>Cataloguer</resp>
                    <name>Gregory Adam Scott</name>
                </respStmt>
                <respStmt>
                    <resp>Photographer</resp>
                    <name/>
                </respStmt>
                <respStmt>
                    <resp>Conversion to TEI encoding</resp>
                    <name>Joe Devlin</name>
                </respStmt>
            </titleStmt>
            <publicationStmt>
                <publisher>The University of Manchester Library</publisher>

                <date calendar="Gregorian">2021</date>
                <pubPlace>
                    <address>
                        <addrLine>The John Rylands Library</addrLine>
                        <street>150 Deansgate</street>
                        <settlement>Manchester</settlement>
                        <postCode>M3 3EH</postCode>
                        <addrLine>
                            <ref target="http://www.library.manchester.ac.uk/specialcollections/">The John Rylands Library</ref>
                        </addrLine>
                        <addrLine>
                            <email>uml.special-collections@manchester.ac.uk</email>
                        </addrLine>
                    </address>
                </pubPlace>
                <idno>UkMaJRU-Chinese-Crawford-23</idno>
                <availability xml:id="displayImageRights" status="restricted">

                    <p>Zooming image © University of Manchester Library, All rights reserved.</p>
                </availability>
                <availability xml:id="downloadImageRights" status="restricted">

                    <licence>Images made available for download are licensed under a Creative
                        Commons Attribution-NonCommercial 4.0 International License (CC BY-NC
                        4.0).</licence>
                </availability>
                <availability xml:id="metadataRights" status="restricted">

                    <licence>Metadata made available for download is licensed under a Creative
                        Commons Attribution-NonCommercial 4.0 International License (CC BY-NC
                        4.0).</licence>
                </availability>
            </publicationStmt>
            <sourceDesc>
                <msDesc xml:lang="eng-GB">

                    <msIdentifier>
                        <country>United Kingdom</country>
                        <region type="county">Greater Manchester</region>
                        <settlement>Manchester</settlement>
                        <institution>The University of Manchester Library</institution>
                        <repository>The John Rylands Library</repository>
                        <idno>Chinese Crawford 23</idno>

                    </msIdentifier>
                    <msContents>
                        <summary>
                            <seg type="para">Named 三字經 (Three Character Classic) because each line
                                in the text is made up of a three-character phrase. A traditional
                                primer for primary education, it teaches Literary Chinese reading as
                                well as elements of history and philosophy. Likely first composed in
                                the 13th century CE, and attributed to several authors but its
                                original author remains unknown. The text was widely used right up
                                to the mid twentieth century, and is still used today though no
                                longer part of formal education. Virtually every educated person in
                                early modern and modern China, and elsewhere in East Asia, would
                                have memorised this text. Printings of this text were widely
                                available in relatively cheap woodblock printed editions. A few
                                lines were added in the early twentieth century to describe the
                                history of the fall of the Qing and the founding of the Republic of
                                China in 1912.</seg>
                        </summary>

                        <msItem>
                            <title xml:lang="chi-Latn-x-lc">San zi jing</title>
                            <title type="alt" xml:lang="chi">三字經</title>
                            <title type="alt" xml:lang="chi-Latn-x-lc">Tu xiang san zi jing</title>
                            <title type="alt" xml:lang="chi">圖像三字經</title>
                            <title type="alt" xml:lang="eng">Translated title: The Three Character
                                Classic</title>

                            <textLang mainLang="chi">Classical Chinese</textLang>


                        </msItem>
                    </msContents>
                    <physDesc>

                        <objectDesc form="codex">
                            <supportDesc>

                                <extent>1冊1盒，共10葉. <dimensions type="leaf" unit="mm">
                                        <height>175</height>
                                        <width>95</width>
                                    </dimensions></extent>

                            </supportDesc>

                        </objectDesc>


                        <bindingDesc>
                            <p>Block printed red paper cover</p>
                        </bindingDesc>
                    </physDesc>
                    <history>

                        <origin>
                            <origDate calendar="Gregorian" notBefore="1801" notAfter="1900">19th
                                century</origDate>
                            <origPlace>文林堂藏版</origPlace>
                        </origin>

                        <acquisition>Purchased by Enriqueta Rylands in <date calendar="Gregorian" when="1901">1901</date> from <name type="person" ref="http://viaf.org/viaf/9985420"><persName type="display">James
                                    Ludovic Lindsay, 26th Earl of Crawford.</persName><persName type="standard" role="fmo">Crawford, James Ludovic Lindsay, Earl
                                    of, 1847-1913</persName></name> Bequeathed by Rylands to the
                            John Rylands Library in 1908.</acquisition>
                    </history>
                    <additional>
                        <adminInfo>
                            <recordHist>
                                <source>Description based on <persName>Li Guoying 李国英</persName>,
                                        <persName>Zhou Xiaowen 周晓⽂</persName>, and <persName>Zhang
                                        Xianrong 张宪荣</persName> (eds), <title>Yingguo Manchesite
                                        Daxue Yuahan Lailanzi tushuguan Zhongwen guji mulu
                                        英國曼徹斯特⼤學約翰·賴闌茲圖書館中⽂古籍⽬錄 = Bibliography of Ancient Chinese
                                        Books Held by the John Rylands Library of the University of
                                        Manchester, United Kingdom</title>, 2 vols. (Beijing:
                                    Zhonghua shuju, 2018), revised and expanded by Gregory Adam
                                    Scott.</source>
                                <!--<change/>-->
                            </recordHist>
                            <availability status="restricted">
                                <p>The manuscript is available for consultation by any accredited
                                    reader.</p>
                            </availability>
                        </adminInfo>
                    </additional>
                </msDesc>
            </sourceDesc>
        </fileDesc>
        <encodingDesc>

            <classDecl>
                <taxonomy xml:id="LCSH">
                    <bibl>
                        <ref target="http://id.loc.gov/authorities/subjects.html#lcsh">Library of
                            Congress Subject Headings</ref>
                    </bibl>
                </taxonomy>
            </classDecl>
        </encodingDesc>
        <profileDesc>
            <textClass>
                <keywords scheme="#LCSH">
                    <list>
                        <item>
                            <term key="subject_sh85076240">Education</term>
                        </item>

                    </list>
                </keywords>
            </textClass>
        </profileDesc>
        <!--<revisionDesc>
			<change when="2021-02-22">
				<persName>Joe Devlin</persName>
			</change>
			<change when="2021-03-04">
				<persName>Julianne Simpson</persName>
			</change>
			<change when="2021-09-08">
				<persName>Julianne Simpson</persName>
			</change>
		</revisionDesc>-->
    </teiHeader>
    <facsimile>
        <graphic decls="#document-thumbnail" rend="portrait" url="PR-CHCR-00023-000-00001.jp2"/>
        <surface xml:id="i1" n="Front_cover">
            <graphic n="JRL18090624" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="4569px" url="PR-CHCR-00023-000-00001.jp2"/>
        </surface>
        <surface xml:id="i2" n="Inner_Front_Cover">
            <graphic n="JRL18090625" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3154px" url="PR-CHCR-00023-000-00002.jp2"/>
        </surface>
        <surface xml:id="i3" n="1">
            <graphic n="JRL18090626" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3222px" url="PR-CHCR-00023-000-00003.jp2"/>
        </surface>
        <surface xml:id="i4" n="2">
            <graphic n="JRL18090627" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3240px" url="PR-CHCR-00023-000-00004.jp2"/>
        </surface>
        <surface xml:id="i5" n="3">
            <graphic n="JRL18090628" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3201px" url="PR-CHCR-00023-000-00005.jp2"/>
        </surface>
        <surface xml:id="i6" n="4">
            <graphic n="JRL18090629" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3200px" url="PR-CHCR-00023-000-00006.jp2"/>
        </surface>
        <surface xml:id="i7" n="5">
            <graphic n="JRL18090630" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3195px" url="PR-CHCR-00023-000-00007.jp2"/>
        </surface>
        <surface xml:id="i8" n="6">
            <graphic n="JRL18090631" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3200px" url="PR-CHCR-00023-000-00008.jp2"/>
        </surface>
        <surface xml:id="i9" n="7">
            <graphic n="JRL18090632" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3195px" url="PR-CHCR-00023-000-00009.jp2"/>
        </surface>
        <surface xml:id="i10" n="8">
            <graphic n="JRL18090633" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3200px" url="PR-CHCR-00023-000-00010.jp2"/>
        </surface>
        <surface xml:id="i11" n="9">
            <graphic n="JRL18090634" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3191px" url="PR-CHCR-00023-000-00011.jp2"/>
        </surface>
        <surface xml:id="i12" n="10">
            <graphic n="JRL18090635" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3200px" url="PR-CHCR-00023-000-00012.jp2"/>
        </surface>
        <surface xml:id="i13" n="11">
            <graphic n="JRL18090636" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3191px" url="PR-CHCR-00023-000-00013.jp2"/>
        </surface>
        <surface xml:id="i14" n="12">
            <graphic n="JRL18090637" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3202px" url="PR-CHCR-00023-000-00014.jp2"/>
        </surface>
        <surface xml:id="i15" n="13">
            <graphic n="JRL18090638" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3191px" url="PR-CHCR-00023-000-00015.jp2"/>
        </surface>
        <surface xml:id="i16" n="14">
            <graphic n="JRL18090639" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3202px" url="PR-CHCR-00023-000-00016.jp2"/>
        </surface>
        <surface xml:id="i17" n="15">
            <graphic n="JRL18090640" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3204px" url="PR-CHCR-00023-000-00017.jp2"/>
        </surface>
        <surface xml:id="i18" n="16">
            <graphic n="JRL18090641" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3203px" url="PR-CHCR-00023-000-00018.jp2"/>
        </surface>
        <surface xml:id="i19" n="17">
            <graphic n="JRL18090642" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3183px" url="PR-CHCR-00023-000-00019.jp2"/>
        </surface>
        <surface xml:id="i20" n="18">
            <graphic n="JRL18090643" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3203px" url="PR-CHCR-00023-000-00020.jp2"/>
        </surface>
        <surface xml:id="i21" n="19">
            <graphic n="JRL18090644" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3207px" url="PR-CHCR-00023-000-00021.jp2"/>
        </surface>
        <surface xml:id="i22" n="20">
            <graphic n="JRL18090645" decls="#downloadImageRights #download" rend="portrait" height="6500px" width="3807px" url="PR-CHCR-00023-000-00022.jp2"/>
        </surface>
    </facsimile>
    <text>
        <body>
            <div>
                <pb n="Front_cover" xml:id="pb-Front_cover" facs="#i1"/>
                <pb n="Inner_Front_Cover" xml:id="pb-Inner_Front_Cover" facs="#i2"/>
                <pb n="1" xml:id="pb-1" facs="#i3"/>
                <pb n="2" xml:id="pb-2" facs="#i4"/>
                <pb n="3" xml:id="pb-3" facs="#i5"/>
                <pb n="4" xml:id="pb-4" facs="#i6"/>
                <pb n="5" xml:id="pb-5" facs="#i7"/>
                <pb n="6" xml:id="pb-6" facs="#i8"/>
                <pb n="7" xml:id="pb-7" facs="#i9"/>
                <pb n="8" xml:id="pb-8" facs="#i10"/>
                <pb n="9" xml:id="pb-9" facs="#i11"/>
                <pb n="10" xml:id="pb-10" facs="#i12"/>
                <pb n="11" xml:id="pb-11" facs="#i13"/>
                <pb n="12" xml:id="pb-12" facs="#i14"/>
                <pb n="13" xml:id="pb-13" facs="#i15"/>
                <pb n="14" xml:id="pb-14" facs="#i16"/>
                <pb n="15" xml:id="pb-15" facs="#i17"/>
                <pb n="16" xml:id="pb-16" facs="#i18"/>
                <pb n="17" xml:id="pb-17" facs="#i19"/>
                <pb n="18" xml:id="pb-18" facs="#i20"/>
                <pb n="19" xml:id="pb-19" facs="#i21"/>
                <pb n="20" xml:id="pb-20" facs="#i22"/>
            </div>
        </body>
    </text>
</TEI>
```

### JSON Example Data

```JSON
[
	{
		"descriptiveMetadata": [
			{
				"thumbnailUrl": "PR-CHCR-00023-000-00001.jp2",
				"thumbnailOrientation": "portrait",
				"displayImageRights": "Zooming image © University of Manchester Library, All rights reserved.",
				"downloadImageRights": "Images made available for download are licensed under a Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).",
				"imageReproPageURL": "https://www.library.manchester.ac.uk/search-resources/manchester-digital-collections/digitisation-services/copyright-and-licensing/",
				"metadataRights": "Metadata made available for download is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).",
				"pdfRights": "",
				"watermarkStatement": "",
				"docAuthority": "",
				"fundings": {
					"display": true,
					"seq": 208,
					"label": "Funding",
					"value": [
						{
							"display": true,
							"displayForm": "",
							"seq": 209
						}
					]
				},
				"subjects": {
					"display": true,
					"seq": 22,
					"listDisplay": "inline",
					"label": "Subject(s)",
					"value": [
						{
							"display": true,
							"displayForm": "Education",
							"seq": 23,
							"linktype": "keyword search",
							"fullForm": "Education",
							"authority": "Library of Congress Subject Headings",
							"authorityURI": "http://id.loc.gov/authorities/about.html#lcsh",
							"valueURI": "subject_sh85076240"
						}
					]
				},
				"dataSources": {
					"display": true,
					"seq": 210,
					"label": "Data Source(s)",
					"value": [
						{
							"display": true,
							"displayForm": "Description based on Li Guoying 李国英, Zhou Xiaowen 周晓⽂, and Zhang Xianrong 张宪荣 (eds), <i>Yingguo Manchesite Daxue Yuahan Lailanzi tushuguan Zhongwen guji mulu 英國曼徹斯特⼤學約翰·賴闌茲圖書館中⽂古籍⽬錄 = Bibliography of Ancient Chinese Books Held by the John Rylands Library of the University of Manchester, United Kingdom</i>, 2 vols. (Beijing: Zhonghua shuju, 2018), revised and expanded by Gregory Adam Scott.",
							"seq": 211
						}
					]
				},
				"ID": "DOCUMENT",
				"abstract": {
					"display": false,
					"displayForm": "<p style='text-align: justify;'>Named 三字經 (Three Character Classic) because each line in the text is made up of a three-character phrase. A traditional primer for primary education, it teaches Literary Chinese reading as well as elements of history and philosophy. Likely first composed in the 13th century CE, and attributed to several authors but its original author remains unknown. The text was widely used right up to the mid twentieth century, and is still used today though no longer part of formal education. Virtually every educated person in early modern and modern China, and elsewhere in East Asia, would have memorised this text. Printings of this text were widely available in relatively cheap woodblock printed editions. A few lines were added in the early twentieth century to describe the history of the fall of the Qing and the founding of the Republic of China in 1912.</p>",
					"label": "Abstract",
					"seq": 11
				},
				"associated": {
					"display": true,
					"seq": 139,
					"listDisplay": "unordered",
					"label": "Associated Name(s)",
					"value": [
						{
							"display": true,
							"displayForm": "Crawford, James Ludovic Lindsay, Earl of, 1847-1913",
							"seq": 140,
							"linktype": "keyword search",
							"fullForm": "Crawford, James Ludovic Lindsay, Earl of, 1847-1913",
							"shortForm": "James Ludovic Lindsay, 26th Earl of Crawford.",
							"type": "person"
						}
					]
				},
				"creations": {
					"display": true,
					"seq": 65,
					"value": [
						{
							"type": "creation",
							"places": {
								"display": true,
								"seq": 70,
								"label": "Origin Place",
								"value": [
									{
										"display": true,
										"displayForm": "文林堂藏版",
										"seq": 71,
										"linktype": "keyword search",
										"shortForm": "文林堂藏版",
										"fullForm": "文林堂藏版"
									}
								]
							},
							"dateStart": "1801",
							"dateEnd": "1801",
							"dateDisplay": {
								"display": true,
								"displayForm": "19th century",
								"linktype": "keyword search",
								"label": "Date of Creation",
								"seq": 79
							}
						}
					]
				},
				"acquisitions": {
					"display": true,
					"seq": 202,
					"value": [
						{
							"type": "acquisition",
							"dateStart": "1901",
							"dateEnd": "1901",
							"dateDisplay": {
								"display": true,
								"displayForm": "1901",
								"label": "Date of Acquisition",
								"seq": 207
							}
						}
					]
				},
				"physicalLocation": {
					"display": true,
					"displayForm": "The John Rylands Library",
					"label": "Physical Location",
					"seq": 4
				},
				"shelfLocator": {
					"display": true,
					"displayForm": "Chinese Crawford 23",
					"label": "Classmark",
					"seq": 5
				},
				"form": {
					"display": true,
					"displayForm": "Codex",
					"label": "Format",
					"seq": 178
				},
				"extent": {
					"display": true,
					"displayForm": "1冊1盒，共10葉. Leaf height: 175 mm, width: 95 mm.",
					"label": "Extent",
					"seq": 173
				},
				"bindings": {
					"display": true,
					"seq": 181,
					"label": "Binding",
					"value": [
						{
							"display": true,
							"displayForm": "<p>Block printed red paper cover</p>",
							"seq": 182
						}
					]
				},
				"acquisitionTexts": {
					"display": true,
					"seq": 200,
					"label": "Acquisition",
					"value": [
						{
							"display": true,
							"displayForm": "Purchased by Enriqueta Rylands in 1901 from James Ludovic Lindsay, 26th Earl of Crawford. Bequeathed by Rylands to the John Rylands Library in 1908.",
							"seq": 201
						}
					]
				},
				"title": {
					"display": false,
					"displayForm": "San zi jing",
					"label": "Title",
					"seq": 10
				},
				"alternativeTitles": {
					"display": true,
					"seq": 16,
					"label": "Alternative Title(s)",
					"value": [
						{
							"display": true,
							"displayForm": "三字經",
							"seq": 17
						},
						{
							"display": true,
							"displayForm": "Tu xiang san zi jing",
							"seq": 17
						},
						{
							"display": true,
							"displayForm": "圖像三字經",
							"seq": 17
						},
						{
							"display": true,
							"displayForm": "Translated title: The Three Character Classic",
							"seq": 17
						}
					]
				},
				"languageCodes": [
					"chi"
				],
				"languageStrings": {
					"display": true,
					"seq": 119,
					"label": "Language(s)",
					"value": [
						{
							"display": true,
							"displayForm": "Classical Chinese",
							"seq": 120
						}
					]
				}
			}
		],
		"numberOfPages": 22,
		"embeddable": true,
		"textDirection": "L",
		"sourceData": "/v1/metadata/tei/data/",
		"pages": [
			{
				"label": "Front_cover",
				"physID": "PHYS-1",
				"sequence": 1,
				"IIIFImageURL": "PR-CHCR-00023-000-00001.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 4569,
				"imageHeight": 6500
			},
			{
				"label": "Inner_Front_Cover",
				"physID": "PHYS-2",
				"sequence": 2,
				"IIIFImageURL": "PR-CHCR-00023-000-00002.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3154,
				"imageHeight": 6500
			},
			{
				"label": "1",
				"physID": "PHYS-3",
				"sequence": 3,
				"IIIFImageURL": "PR-CHCR-00023-000-00003.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3222,
				"imageHeight": 6500
			},
			{
				"label": "2",
				"physID": "PHYS-4",
				"sequence": 4,
				"IIIFImageURL": "PR-CHCR-00023-000-00004.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3240,
				"imageHeight": 6500
			},
			{
				"label": "3",
				"physID": "PHYS-5",
				"sequence": 5,
				"IIIFImageURL": "PR-CHCR-00023-000-00005.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3201,
				"imageHeight": 6500
			},
			{
				"label": "4",
				"physID": "PHYS-6",
				"sequence": 6,
				"IIIFImageURL": "PR-CHCR-00023-000-00006.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3200,
				"imageHeight": 6500
			},
			{
				"label": "5",
				"physID": "PHYS-7",
				"sequence": 7,
				"IIIFImageURL": "PR-CHCR-00023-000-00007.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3195,
				"imageHeight": 6500
			},
			{
				"label": "6",
				"physID": "PHYS-8",
				"sequence": 8,
				"IIIFImageURL": "PR-CHCR-00023-000-00008.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3200,
				"imageHeight": 6500
			},
			{
				"label": "7",
				"physID": "PHYS-9",
				"sequence": 9,
				"IIIFImageURL": "PR-CHCR-00023-000-00009.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3195,
				"imageHeight": 6500
			},
			{
				"label": "8",
				"physID": "PHYS-10",
				"sequence": 10,
				"IIIFImageURL": "PR-CHCR-00023-000-00010.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3200,
				"imageHeight": 6500
			},
			{
				"label": "9",
				"physID": "PHYS-11",
				"sequence": 11,
				"IIIFImageURL": "PR-CHCR-00023-000-00011.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3191,
				"imageHeight": 6500
			},
			{
				"label": "10",
				"physID": "PHYS-12",
				"sequence": 12,
				"IIIFImageURL": "PR-CHCR-00023-000-00012.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3200,
				"imageHeight": 6500
			},
			{
				"label": "11",
				"physID": "PHYS-13",
				"sequence": 13,
				"IIIFImageURL": "PR-CHCR-00023-000-00013.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3191,
				"imageHeight": 6500
			},
			{
				"label": "12",
				"physID": "PHYS-14",
				"sequence": 14,
				"IIIFImageURL": "PR-CHCR-00023-000-00014.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3202,
				"imageHeight": 6500
			},
			{
				"label": "13",
				"physID": "PHYS-15",
				"sequence": 15,
				"IIIFImageURL": "PR-CHCR-00023-000-00015.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3191,
				"imageHeight": 6500
			},
			{
				"label": "14",
				"physID": "PHYS-16",
				"sequence": 16,
				"IIIFImageURL": "PR-CHCR-00023-000-00016.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3202,
				"imageHeight": 6500
			},
			{
				"label": "15",
				"physID": "PHYS-17",
				"sequence": 17,
				"IIIFImageURL": "PR-CHCR-00023-000-00017.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3204,
				"imageHeight": 6500
			},
			{
				"label": "16",
				"physID": "PHYS-18",
				"sequence": 18,
				"IIIFImageURL": "PR-CHCR-00023-000-00018.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3203,
				"imageHeight": 6500
			},
			{
				"label": "17",
				"physID": "PHYS-19",
				"sequence": 19,
				"IIIFImageURL": "PR-CHCR-00023-000-00019.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3183,
				"imageHeight": 6500
			},
			{
				"label": "18",
				"physID": "PHYS-20",
				"sequence": 20,
				"IIIFImageURL": "PR-CHCR-00023-000-00020.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3203,
				"imageHeight": 6500
			},
			{
				"label": "19",
				"physID": "PHYS-21",
				"sequence": 21,
				"IIIFImageURL": "PR-CHCR-00023-000-00021.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3207,
				"imageHeight": 6500
			},
			{
				"label": "20",
				"physID": "PHYS-22",
				"sequence": 22,
				"IIIFImageURL": "PR-CHCR-00023-000-00022.jp2",
				"thumbnailImageOrientation": "portrait",
				"imageWidth": 3807,
				"imageHeight": 6500
			}
		],
		"logicalStructures": [
			{
				"descriptiveMetadataID": "DOCUMENT",
				"label": "San zi jing",
				"startPageLabel": "Front_cover",
				"startPagePosition": 1,
				"startPageID": "PHYS-1",
				"endPageLabel": "20",
				"endPagePosition": 22
			}
		]
	}
]
```

## 4. Local Isolated Testing

1. Reconfigure Localhost

Run this in terminal:
```bash
sudo nano /etc/hosts
```

add ``kafka`` as one of the names for 127.0.0.1

```bash
127.0.0.1       kafka
127.0.0.1       localhost
```

2. Run temporary Kafka Instance

Go to the ```kafka-dev``` directory and run ```docker compose up```
```bash
rc-api/kafka-dev$ docker compose up
```
Leave this terminal running and open another terminal for other work

3. Run the local service in NodeJS

For example, the XSLT service:

```bash
rc-api/xslt-service$ node app.js
```

### 1. XSLT Testing

You can change the XSL process inside ```rc-api/xslt-service/utils/xslt``` directory.

Here the ```msTeiPreFilter.xsl``` and ```jsonDocFormatter.xsl``` file can be changed

After setting up for [local isolated testing](#4-local-isolated-testing), run the ```xslt-service``` using
```bash
rc-api/xslt-service$ node app.js
```

You can test the output by sending a ```post``` request to:

http://localhost:3009/api/v1/xslt/[:id]

for example, you ```post``` [this TEI](#3-example-data) to http://localhost:3009/api/v1/xslt/PR-CHCR-00023 

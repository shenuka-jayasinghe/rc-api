# R-Collections API

## Dependencies

1. [Docker](https://www.docker.com/products/docker-desktop/)
2. [Node](https://nodejs.org/en/download)

## Steps

1. [Run the Containers](#1-run-the-containers)
2. [Test the API](#2-test-the-api)
3. [Check the Kafka Topic](#3-check-the-kafka-topic)

### 1. Run the Containers

1. In the root directory run (sudo is optional)

```bash
sudo docker compose up -d
```

2. Then cache the [```shenukacj/cudl-xslt:0.0.5```](https://github.com/shenuka-jayasinghe/cudl-data-processing-xslt/blob/main/Dockerfile) container and run the node server using the terminal:

```bash
sudo docker exec -it tei2json-api docker run shenukacj/cudl-xslt:0.0.5 && sudo docker exec -it tei2json-api node app.js
```

3. You can shut down the docker containers using ```sudo docker compose down``` in the root directory

### 2. Test the API


1. Test the API using a ```post``` request to the endpoint, ```http://localhost:3001/api/v1/tei2json/cudl-xslt``` with a sample TEI file (make sure the post is with ```xml``` body) such as the following:
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

### 3. Check the Kafka Topic

1. Check that the JSON data has also been posted to the Kafka Topic

``` bash
sudo docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server kafka:9092 --topic cudl-json-topic --from-beginning
```
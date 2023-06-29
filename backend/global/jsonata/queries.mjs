const QUERY_ID_USER_MENU = 'f3ee63af-bcd6-49bb-bc2a-a9849772e602';
const QUERY_ID_CONTEXT = 'd426ffcb-c482-4a30-aa6f-3f86e754953a';
const QUERY_ID_COMPONENT = '42a911e9-85ff-4c7a-a381-f8812b5b50d3';
const QUERY_ID_CONTEXTS_FOR_COMPONENT = 'd671abec-f448-4f07-b914-252394402402';
const QUERY_ID_SUMMARY_FOR_COMPONENT = '23e2922d-0212-4caf-af4b-1b55ebdec53f';
const QUERY_ID_WIDGETS_FOR_COMPONENT = 'af621e21-986d-4292-99a1-c226097face7';
const QUERY_ID_COMPONENT_LOCATIONS = 'b0c71bbf-e4ef-43d3-8f9c-2fd5af1cad59';
const QUERY_ID_ASPECT = 'e4ec1603-cef8-4ca9-815d-eabf5839284b';
const QUERY_ID_SUMMARY_ASPECT = '7b1943b0-e038-4a8b-bfb2-ee8406b3eac3';
const QUERY_ID_WIDGETS_FOR_ASPECT = 'c82493f7-e8f3-447d-a4a6-b5125f59c37d';
const QUERY_ID_DEFAULT_CONTEXT_ASPECT = '3086a94c-74e7-411f-ab36-c8ebba876046';
const QUERY_ID_ASPECT_LOCATIONS = '9411d5c0-08c0-47ff-b009-8a0a1f185ecc';
const QUERY_ID_CONTEXTS_FOR_ASPECT = 'cc083f78-efe9-451c-9b27-c404dafb989b';
const QUERY_ID_COMPONENTS_FOR_ASPECT = '9b212a3f-661d-45fc-a66b-50e537438276';
const QUERY_ID_TECHNOLOGIES = 'acfb0fde-c328-4852-82e6-1d8bb24bedaa';
const QUERY_ID_TECHNOLOGY = '1aac84f9-369b-4c5e-883a-b1e4e0dfde7c';
const QUERY_ID_DOCUMENTS_FOR_ENTITY = 'f20896a6-dd0b-4977-81f0-a5f111253d0e';
const QUERY_ID_MINDMAP_COMPONENTS = '45498bf4-7e31-47e6-bd1f-66377fa8511e';
const QUERY_ID_MINDMAP_ASPECTS = '8611eef5-f310-463a-88ff-931d8d88b2ae';

const QUERY_ID_JSONSCEMA_ENTITIES = '2e38141a-100a-4331-bc80-5dd198acc8b8';

const QUERY_GET_OBJECT = '5786bdd1-07bd-4c6c-b1fb-d8efe2c7368f';

// Строит пользовательское меню
// Предопределенные запросы
const queries = {
    // Строит пользовательское меню
    [QUERY_ID_USER_MENU]: `
    (
        $isURL := $matcher := /^[a-zA-Z]*\\:.*$/i;
        $isRoot := $matcher := /^\\/.*$/i;
    
        $append((
            $GET_TITLE := function($LOCATION) {(
                $STRUCT := $split($LOCATION, "/");
                $STRUCT[$count($STRUCT) - 1];
            )};
        
            $MANIFEST := $;
            $append([
                    {
                        "title": 'Архитектура',
                        "location": 'Архитектура',
                        "route": 'architect/',
                        "expand": true,
                        "icon": 'home'
                    },
                    {
                        "title": "Аспекты",
                        "location": 'Архитектура/Аспекты',
                        "icon": 'visibility',
                        "route": 'aspects/'
                    },
                    aspects.$spread().{
                        "title": $GET_TITLE($.*.location),
                        "route": 'architect/aspects/' & $keys()[0],
                        "location": 'Архитектура/Аспекты/' & $.*.location,
                        "icon": $.*.icon ? $.*.icon : ''
                    },
                    {
                        "title": 'Техрадар',
                        "location": 'Техрадар',
                        "route": 'techradar',
                        "icon": 'track_changes'
                    },
                    technologies.sections.$spread().{
                        "title": $.*.title,
                        "route": 'techradar/' & $keys()[0],
                        "location": 'Техрадар/' & $.*.title
                    },
                    {
                        "title": 'Проблемы',
                        "location": 'Проблемы',
                        "route": 'problems',
                        "icon": 'report_problem'
                    }
                ][($exists(hiden) and $not(hiden)) or $not($exists(hiden))],
                entities.*.(
                    $eval(menu, $MANIFEST).{
                        "route": link,
                        "location": location,
                        "icon": icon,
                        "title": $GET_TITLE(location)
                    }
                )
            )
        ).{
            "title": "" & title,
            "route": route ? (
                $isURL(route) ? route
                : ($isRoot(route) ? route : '/' & route)
            ) : undefined,
            "icon": icon,
            "location": "" & (location ? location : route)
        }^(location), [
            {
                "title": 'JSONata',
                "route": '/devtool',
                "icon": 'chrome_reader_mode',
                "location": "devtool"
            }
        ])
    )
    `,
    // Строит контекст
    [QUERY_ID_CONTEXT]: `
    (
        $CONTEXT_ID := '{%CONTEXT_ID%}';
        $MANIFEST := $;
        $datasets := datasets;
        $isQuery := /^(\\s|\\S)*\\(.*\\)(\\s|.)*$/;
        $isDataSet := /^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*$/;
        $evalData := function($data, $context) {(
            $isQuery($data) ? (
                $eval($data, $context)
            ) : (
                $data = "manifest" ? $MANIFEST : (
                    $isDataSet($data) ? $releaseData($lookup($datasets, $data), $context) : $data
                )
            )
        )};
        $releaseData := function($subject, $context) {(
            $data := $subject.origin ? (
                $type($subject.origin) = "object" ? (
                    $merge($subject.origin.$spread().{
                        $keys()[0]: $evalData($.*, $MANIFEST)
                    })
                ) : $evalData($subject.origin, $MANIFEST)
            ) : $context;
        
            $type($subject.source) = "string" ? (
                $evalData($subject.source, $data)
            ) : $data;
        )};
        $CONTEXT := $CONTEXT_ID = 'self' ? {"title": "Собственный"} : $lookup(contexts, $CONTEXT_ID);
        $MANIFEST := $releaseData($CONTEXT, $);
        $ARRLEFT := function($ARR ,$COUNT) {
            $map($ARR, function($v, $i) {
                $i < $COUNT ? $v : undefined
            })
        };
        $MKNS := function($IDS) {(
            $map($IDS, function($v, $i) {(
                $ID := $join($ARRLEFT($IDS, $i + 1), ".");
                $IS_CONTEXT := $lookup($MANIFEST.contexts, $ID);
                $IS_COMPONENT := $lookup($MANIFEST.components, $ID);
                $TITLE := $IS_COMPONENT.title;
                $TITLE := $TITLE ? $TITLE : $lookup($MANIFEST.namespaces, $ID).title;
                $TITLE := $TITLE ? $TITLE : $ID;
                {
                    "id": $ID,
                    "title": $TITLE,
                    "link": ($IS_CONTEXT ? "/architect/contexts/" & $ID : ($IS_COMPONENT ? "/architect/components/" & $ID)),
                    "type": $NAMESPACE.type
                }
            )})
        )};
        {
            "title": $CONTEXT.title ? $CONTEXT.title : $CONTEXT_ID,
            "id": $CONTEXT_ID,
            "uml": $CONTEXT.uml,
            "extra": $CONTEXT."extra-links",
            "components": [$CONTEXT.components.(
                $WILDCARD := $;
                $NAMESPACES_IDS := $split($, ".");
                $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                    $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                });
                $COMPONENT := $ ? $lookup($MANIFEST.components, $);
                $COMPONENTS := $COMPONENT 
                    ? [$merge([$COMPONENT, {"id": $}])]
                    : [(
                        $MANIFEST.components.$spread().(
                            $wcard($keys()[0], $WILDCARD) 
                            ? $merge([{"id" : $keys()[0]}, $.*])
                        );
                    )];
                $COMPONENTS.(
                    $COMPONENT_ID   := $.id;
                    $COMPONENT      := $;
                    {
                        "order": $NAMESPACE_ID & ":" & $COMPONENT_ID,
                        "id": $COMPONENT_ID,
                        "title": $COMPONENT.title,
                        "entity": $COMPONENT.entity ? $COMPONENT.entity : 'component',
                        "type": $COMPONENT.type,
                        "namespaces":[$MKNS($NAMESPACES_IDS)],
                        "is_context": $COMPONENT_ID ? ($lookup($MANIFEST.contexts, $COMPONENT_ID) ? true : false),
                        "links": [$distinct($COMPONENT.links)[id].(
                            $ID := $.id;
                            $COMPONENT := $ID ? $lookup($MANIFEST.components, $ID);
                            $NAMESPACES_IDS := $split($ID, ".");
                            $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                                $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                            });
                            $CONTRACT := $.contract ? $lookup($MANIFEST.docs, $.contract);
                            {
                                "id": $ID,
                                "title": $COMPONENT.title ? $COMPONENT.title : $ID,
                                "direction": $.direction ? $.direction : '--',
                                "link_title": $.title,
                                "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                                "namespaces":[$MKNS($NAMESPACES_IDS)],
                                "contract": $.contract ? {
                                    "id": $.contract,
                                    "location": $CONTRACT.location
                                } : undefined
                            }
                        )],
                        "aspects": [$COMPONENT.aspects.$spread().(
                            $ASPECT := $ ? $lookup($MANIFEST.aspects, $);
                            {
                                "id": $,
                                "title": $ASPECT.title ? $ASPECT.title : $
                            }
                        )]
                    }                
                )
                
            )]^(order)[]
        };
    )
    `,    
    // Строит карточку контекста
    [QUERY_ID_COMPONENT] : `
    (
        $MANIFEST := $;
        $CONTEXT_ID := 'self';
        $CONTEXT := {"title": "Собственный"};
        $ARRLEFT := function($ARR ,$COUNT) {
            $map($ARR, function($v, $i) {
                $i < $COUNT ? $v : undefined
            })
        };
        $MKNS := function($IDS) {(
            $map($IDS, function($v, $i) {(
                $ID := $join($ARRLEFT($IDS, $i + 1), ".");
                $IS_COMPONENT := $lookup($MANIFEST.components, $ID);
                $IS_CONTEXT := $lookup($MANIFEST.contexts, $ID);
                $TITLE := $IS_COMPONENT.title;
                $TITLE := $TITLE ? $TITLE : $lookup($MANIFEST.namespaces, $ID).title;
                $TITLE := $TITLE ? $TITLE : $ID;
                {
                    "id": $ID,
                    "title": $TITLE,
                    "link": ($IS_CONTEXT ? "/architect/contexts/" & $ID : ($IS_COMPONENT ? "/architect/components/" & $ID)),
                    "type": $NAMESPACE.type
                }
            )})
        )};
        $COMPONENT_ID := '{%COMPONENT_ID%}';
        $COMPONENT := $lookup($MANIFEST.components, $COMPONENT_ID);
        {
            "title": $CONTEXT.title,
            "id": $CONTEXT_ID,
            "components": [$COMPONENT.(
                $NAMESPACES_IDS := $split($COMPONENT_ID, ".");
                $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                    $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                });
                {
                    "order": $NAMESPACE_ID & ":" & $COMPONENT_ID,
                    "id": $COMPONENT_ID,
                    "title": $COMPONENT.title,
                    "entity": $COMPONENT.entity,
                    "type": $COMPONENT.type,
                    "namespaces":[$MKNS($NAMESPACES_IDS)],
                    "is_context": $COMPONENT_ID ? ($lookup($MANIFEST.contexts, $COMPONENT_ID) ? true : false),
                    "contexts": $distinct(
                        $MANIFEST.contexts.$spread()[$COMPONENT_ID in *.components].$keys()[0]
                    ),
                    "links": [$distinct($COMPONENT.links).(
                        $COMPONENT := $.id ? $lookup($MANIFEST.components, $.id);
                        $NAMESPACES_IDS := $split($.id, ".");
                        $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                            $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                        });
                        $CONTRACT := $.contract ? $lookup($MANIFEST.docs, $.contract);
                        {
                            "id": $.id,
                            "title": $COMPONENT.title ? $COMPONENT.title : $.id,
                            "direction": $.direction ? $.direction : '--', 
                            "link_title": $.title,
                            "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                            "namespaces":[$MKNS($NAMESPACES_IDS)],
                            "contract": $.contract ? {
                                "id": $.contract, 
                                "location": $CONTRACT.location
                            } : undefined
                        }
                    )],
                    "aspects": [$COMPONENT.aspects.$spread().(
                        $ASPECT := $ ? $lookup($MANIFEST.aspects, $);
                        {
                        "id": $,
                        "title": $ASPECT.title ? $ASPECT.title : $
                    })]
                }
            )]^(order)[]
        }
    )
    `,
    [QUERY_ID_MINDMAP_COMPONENTS]  : `
    (
        $FILTER := '{%ROOT%}';
        $FILTER_LN := $length($FILTER);
        $CONTEXTS := contexts;
        $COMPONENTS := components;
        $PARENTS := $FILTER.$split(".")~>$map(function($v, $i, $a){(
            $LIMIT := $i;
            $a~>$map(function($v, $i) { $i <= $LIMIT ? $v})~>$join(".");
        )});
        [[components.$spread().(
            $ID := $keys()[0];
            $PREFIX := $substring($ID, 0, $FILTER_LN + 1);
            $IS_CONTEXT := $lookup($CONTEXTS, $ID);
            $FILTER_LN = 0
            or ($PREFIX = $FILTER) or ($PREFIX = ($FILTER & "."))
            or ($ID in $PARENTS) ? (
            {
                "id": $ID,
                "title": $.*.title,
                "link": $IS_CONTEXT ? "/architect/contexts/" & $ID : "/architect/components/" & $ID
            }) : undefined
        )]^(id)]
    )`,
    // Находит контексты, где компонент встречается
    [QUERY_ID_CONTEXTS_FOR_COMPONENT] : `
    (
        $MANIFEST := $;
        [$distinct([contexts.$spread().(
            $CONTEXT := $;
            $ID := $keys()[0];
            *.components[$wcard('{%COMPONENT%}', $)].{
                "id": $ID,
                "title": $CONTEXT.*.title
            }
        )])];
    )
    `,
    [QUERY_ID_SUMMARY_FOR_COMPONENT] : `
    (
        $COMPONENT_ID := '{%COMPONENT_ID%}';
        $MANIFEST := $;
        $lookup(components, $COMPONENT_ID).(
            $COMPONENT := $;
            $ENTITY := $.entity ? $.entity : "component";
            $FORM := $MANIFEST.forms[entity.$contains($ENTITY)].fields;
            
            $append([
                {
                    "title": "Идентификатор",
                    "content": $COMPONENT_ID,
                    "field": "id",
                    "required": true
                },
                {
                    "title": "Название",
                    "content": title,
                    "field": "title",
                    "required": true
                }
            ], $merge($FORM).$spread().{
                "title": $.*.title,
                "required": $.*.required,
                "content": $lookup($COMPONENT, $.$keys()),
                "field": $.$keys()
            });
        )
    )
    `,
    [QUERY_ID_WIDGETS_FOR_COMPONENT] :`
    (
        $pres := entities.components.presentations;
        [$pres.blank.widgets.$spread().(
            $merge([{ "id": $keys()[0]}, *])
        )]
    )
    `,
    [QUERY_ID_COMPONENT_LOCATIONS] : `
    (
        [$lookup($, '/components/' & '{%COMPONENT_ID%}').{
            "link": $,
            "title": $
        }]
    )
    `,
    [QUERY_ID_ASPECT] : `
    (
        $MANIFEST := $;
        $CONTEXT_ID := '{%CONTEXT_ID%}';
        $CONTEXT := $CONTEXT_ID = 'self' ? {"title": "Собственный"} : $lookup($MANIFEST.contexts, $CONTEXT_ID);
        $ARRLEFT := function($ARR ,$COUNT) {
            $map($ARR, function($v, $i) {
                $i < $COUNT ? $v : undefined
            })
        };
        $MKNS := function($IDS) {(
            $map($IDS, function($v, $i) {(
                $ID := $join($ARRLEFT($IDS, $i + 1), ".");
                $IS_COMPONENT := $lookup($MANIFEST.components, $ID);
                $IS_CONTEXT := $lookup($MANIFEST.contexts, $ID);
                $TITLE := $IS_COMPONENT.title;
                $TITLE := $TITLE ? $TITLE : $lookup($MANIFEST.namespaces, $ID).title;
                $TITLE := $TITLE ? $TITLE : $ID;
                {
                    "id": $ID,
                    "title": $TITLE,
                    "link": ($IS_CONTEXT ? "/architect/contexts/" & $ID : ($IS_COMPONENT ? "/architect/components/" & $ID)),
                    "type": $NAMESPACE.type
                }
            )})
        )};
        {
            "title": $CONTEXT.title ? $CONTEXT.title : $CONTEXT_ID,
            "id": $CONTEXT_ID,
            "uml": $CONTEXT.uml,
            "extra": $CONTEXT."extra-links",
            "components": [components.$spread().(
                $COMPONENT_ID := $keys()[0];
                $NAMESPACES_IDS := $split($keys()[0], ".");
                $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                    $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                });
                {
                    "order": $NAMESPACE_ID & ":" & $keys()[0],
                    "id": $COMPONENT_ID,
                    "title": $.*.title,
                    "entity": $.*.entity,
                    "type": $.*.type,
                    "namespaces":[$MKNS($NAMESPACES_IDS)],
                    "contexts": $distinct(
                        $MANIFEST.contexts.$spread()[$COMPONENT_ID in *.components].$keys()[0]
                    ),
                    "links": [$distinct($.*.links).(
                        $COMPONENT := $lookup($MANIFEST.components, $.id);
                        $NAMESPACES_IDS := $split($.id, ".");
                        $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                            $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                        });
                        $CONTRACT := $lookup($MANIFEST.docs, $.contract);
                        {
                            "id": $.id,
                            "title": $COMPONENT.title ? $COMPONENT.title : $.id,
                            "direction": $.direction ? $.direction : '--',
                            "link_title": $.title,
                            "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                            "namespaces":[$MKNS($NAMESPACES_IDS)],
                            "contract": $.contract ? {
                                "id": $.contract,
                                "location": $CONTRACT.location
                            } : undefined
                        }
                    )],
                    "aspects": [$.*.aspects.$spread().(
                        $ASPECT := $lookup($MANIFEST.aspects, $);
                        {
                        "id": $,
                        "title": $ASPECT.title ? $ASPECT.title : $
                    })]
                }
            )]['{%ASPECT_ID%}' in aspects.id]^(order)[]
        }
    )
    `,
    [QUERY_ID_MINDMAP_ASPECTS] : `
    (
        $MANIFEST := $;
        $FILTER := '{%ROOT%}';
        $FILTER_LN := $length($FILTER);
        $USED_ASPECTS := $distinct($.components.*.aspects);
        $PARENTS := $FILTER.$split(".")~>$map(function($v, $i, $a){(
            $LIMIT := $i;
            $a~>$map(function($v, $i) { $i <= $LIMIT ? $v})~>$join(".");
        )});
        $ASPECTS := $distinct($append(aspects.$spread().$keys()[0], $PARENTS));
        $RESULT := [[$ASPECTS.(
            $PREFIX := $substring("" & $, 0, $FILTER_LN + 1);
            $ID := $;
            $FILTER_LN = 0
            or $PREFIX = $FILTER
            or $PREFIX = ($FILTER & ".")
            or ($ID in $PARENTS)
            ? (
                $ASPECT := $lookup($MANIFEST.aspects, $);
                $FOUND := $ASPECT ? 1 : 0;
                {
                    "id": $,
                    "title": $FOUND ? "[[/architect/aspects/" & $ID & " " & ($ASPECT.title ? $ASPECT.title : $ID) & "]]" : $ID,
                    "used": $ in $USED_ASPECTS
                }
            ) : undefined
        )]^(id)]
    )`,
    [QUERY_ID_SUMMARY_ASPECT] : `
    (
        $ASPECT_ID := '{%ASPECT_ID%}';
        $MANIFEST := $;
        $lookup(aspects, $ASPECT_ID).(
            $ASPECT := $;
            $FORM := $MANIFEST.forms["aspect" in entity].fields;
            $FIELDS := $append([
                {
                    "title": "Идентификатор",
                    "content": $ASPECT_ID,
                    "field": "id",
                    "required": true
                },
                {
                    "title": "Название",
                    "content": title,
                    "field": "title",
                    "required": true
                }
            ], $FORM.$spread().{
                "title": $.*.title,
                "required": $.*.required,
                "content": $lookup($ASPECT, $keys()[0]),
                "field": $keys()[0]
            });
        )
    )
    `,
    [QUERY_ID_WIDGETS_FOR_ASPECT] : `
    (
        $pres := entities.aspects.presentations;
        [$pres.blank.widgets.$spread().(
            $merge([{ "id": $keys()[0]}, *])
        )]
    )   
    `,
    [QUERY_ID_DEFAULT_CONTEXT_ASPECT] : `
    (
        $ASPECT_ID := '{%ASPECT_ID%}';
        $MANIFEST := $;
        $lookup(aspects, $ASPECT_ID).(
                    $.'default-context'
        )
    )
    `,
    [QUERY_ID_ASPECT_LOCATIONS] : `
    (
        [$lookup($, '/aspects/' & '{%ASPECT_ID%}').{
            "link": $,
            "title": $
        }]
    )
    `,
    [QUERY_ID_CONTEXTS_FOR_ASPECT] : `
    (
        $MANIFEST := $;
        [$distinct(
        components.$spread().(
            $COMPONENT_ID := $keys()[0];
            *.['{%ASPECT_ID%}' in aspects] ? 
            (
                [$MANIFEST.contexts.$spread().(
                    $CONTEXT_ID := $keys()[0];
                    $TITLE := *.title;
                    *.components[$wcard($COMPONENT_ID, $)].{
                        "id": $CONTEXT_ID,
                        "title": $TITLE
                    }
                )];
            ) : undefined
        ))];
    )
    `,
    [QUERY_ID_COMPONENTS_FOR_ASPECT] : `
    (
        $MANIFEST := $;
        components.$spread().(
            $KEY := $keys()[0];
            $.*.aspects[$ = '{%ASPECT_ID%}'] ? [(
                $COMPONENT := $lookup($MANIFEST.components, $KEY);
                {
                    "title": $COMPONENT.title,
                    "id" : $KEY
                }
            )]
        )
    )
    `,
    [QUERY_ID_TECHNOLOGIES] : `
    (
        $MANIFEST := $;
        $DOTS := $distinct($distinct(components.*.technologies).(
            $TECHKEY := $;
            $TECHNOLOGY := $lookup($MANIFEST.technologies.items, $type($)="string" ? $ : undefined);
            $TECHNOLOGY := $TECHNOLOGY ? $merge([$TECHNOLOGY, {"id": $TECHKEY}]) : $single(
                $spread(
                    $sift($MANIFEST.technologies.items, function($v, $k) {
                        [$TECHKEY in $v.aliases]}
                    )
                ), function($v, $k){ $k=0 }).$merge([$.*, {"id": $keys($)}]);
            $TECHNOLOGY := $TECHNOLOGY ? $TECHNOLOGY : {
                "id": $TECHKEY,
                "section": "UNKNOWN",
                "title": "Не определено"
            }; 
            $SECTION := $lookup($MANIFEST.technologies.sections, $TECHNOLOGY.section);
            {
                "label": $TECHNOLOGY.id,
                "key": $TECHNOLOGY.id,
                "hint": $TECHNOLOGY.title,
                "link": $TECHNOLOGY.link,
                "status": $TECHNOLOGY.status,
                "section" : {
                    "key": $TECHNOLOGY.section,
                    "title": $SECTION.title ? $SECTION.title : "Не определено"
                }
            }
        ));

        {
            "sections": $merge([$DOTS.section.({key: $})]),
            "dots": $DOTS
        }
    )
    `,
    [QUERY_ID_TECHNOLOGY] : `
    (
        $MANIFEST := $;
        $TECH_ID := '{%TECH_ID%}';
        $TECHNOLOGY := $lookup(technologies.items, $TECH_ID);
        $TECHNOLOGY := $TECHNOLOGY ? $TECHNOLOGY : technologies.items.*[$TECH_ID in aliases];
        $COMPONENTS := $distinct($append(
                $MANIFEST.components.*[$TECH_ID in technologies], 
                $TECHNOLOGY.aliases.(
                    $ALIAS := $;
                    $MANIFEST.components.*[$ALIAS in technologies];
                )
        ));
        $COMPONENTS := $filter($MANIFEST.components.$spread(), function($v) {
                $lookup($v, $v.$keys()[0]) in $COMPONENTS
        }).$spread().{
                "id": $keys()[0],
                "title": *.title,
                "entity": *.entity ? *.entity : "component",
                "contexts": [*.presentations.contexts.$spread().(
                    $CONTEXT := $lookup($MANIFEST.contexts, $);
                    {
                        "id": $,
                        "title": $CONTEXT.title ? $CONTEXT.title : $
                    }
                )],
                "technologies": [*.technologies]
            };
        $CONTEXTS := $distinct($COMPONENTS.contexts);
        {
            'title': $TECHNOLOGY.title,
            'link': $TECHNOLOGY.link,
            'aliases': $TECHNOLOGY.aliases,
            'components': $COMPONENTS,
            'contexts': $CONTEXTS
        }
    )
    `,
    [QUERY_ID_DOCUMENTS_FOR_ENTITY] : `
    (
        $ENTITY_ID := '{%ENTITY%}';
        $MANIFEST := $;
        [docs.$spread().(
            $LINK := "/docs/" & $keys()[0];
            $ENTITY_ID in *.subjects ?
            [$[$ENTITY_ID in *.subjects]
                {
                    "location": *.location,
                    "title": *.description,
                    "link": $LINK
                }] : undefined;
        )[location]^(location)];
    )
    `,
    [QUERY_ID_JSONSCEMA_ENTITIES] : `
    (
        $manifest := $;
        {
            "type": "object",
            "properties": $merge([
                $manifest.entities.$spread().({
                    $keys()[0]: $.*.schema
                })
            ]),
            "$defs": $merge([$manifest.entities.*.schema."$defs"])
        };
    )
    `,
    [QUERY_GET_OBJECT]: `
    (
        $self := {%OBJECT_ID%};
        $self."$constructor" ? $eval($self."$constructor") : $self;
    )
    `
};

export default {
    // Идентификаторы предопределенных запросов
    IDS: {
        USER_MENU: QUERY_ID_USER_MENU,
        CONTEXT: QUERY_ID_CONTEXT,

        COMPONENT: QUERY_ID_COMPONENT,
        MINDMAP_COMPONENTS: QUERY_ID_MINDMAP_COMPONENTS,
        CONTEXTS_FOR_COMPONENT: QUERY_ID_CONTEXTS_FOR_COMPONENT,
        SUMMARY_FOR_COMPONENT: QUERY_ID_SUMMARY_FOR_COMPONENT,
        WIDGETS_FOR_COMPONENT: QUERY_ID_WIDGETS_FOR_COMPONENT,
        COMPONENT_LOCATIONS : QUERY_ID_COMPONENT_LOCATIONS,

        ASPECT: QUERY_ID_ASPECT,
        MINDMAP_ASPECTS: QUERY_ID_MINDMAP_ASPECTS,
        SUMMARY_ASPECT: QUERY_ID_SUMMARY_ASPECT,
        WIDGETS_FOR_ASPECT: QUERY_ID_WIDGETS_FOR_ASPECT,
        DEFAULT_CONTEXT_ASPECT: QUERY_ID_DEFAULT_CONTEXT_ASPECT,
        ASPECT_LOCATIONS: QUERY_ID_ASPECT_LOCATIONS,
        CONTEXTS_FOR_ASPECT: QUERY_ID_CONTEXTS_FOR_ASPECT,
        COMPONENTS_FOR_ASPECT: QUERY_ID_COMPONENTS_FOR_ASPECT,

        TECHNOLOGIES: QUERY_ID_TECHNOLOGIES,
        TECHNOLOGY: QUERY_ID_TECHNOLOGY,

        DOCUMENTS_FOR_ENTITY: QUERY_ID_DOCUMENTS_FOR_ENTITY,
        JSONSCEMA_ENTITIES: QUERY_ID_JSONSCEMA_ENTITIES,


        // Возвращает объект по идентификатору с выполнением конструктора
        GET_OBJECT: QUERY_GET_OBJECT
    },
    // Предопределенные запросы
    QUERIES: queries,
    // Вставляет в запрос параметры
    makeQuery(query, params) {
        // eslint-disable-next-line no-useless-escape
        return query.replace(/.*(\{\%([A-Z|\_]*)\%\}).*/g, (p1, p2, p3) => {
            return `${p1.replace(eval(`/{%${p3}%}/g`), params[p3])}`;
        });
    }
};


console.log("Running LinkedIn Extractor Script");

(async () => {
  const { apiKey: API_KEY, currentResponse } = await chrome.storage.local.get(['apiKey', 'currentResponse']);

  console.log(currentResponse);
  const postResponse = async (json) => {
    const res = await fetch(`https://test-api.trado.fi/?apikey=${API_KEY}`, {
      method: "post",
      body: JSON.stringify({
        parsedData: json,
      }),
      mode: "cors",
    });

    return res.json();
  };

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms*1000));
}

  const sendMessage = async (content) => { 

    console.log("Sending Message!");
    return new Promise((resolve, reject) => {
      const eleExists = document.querySelector('div.pvs-profile-actions').querySelector('a[href*="messaging"]');
      if (eleExists) {
        eleExists.click();

        let sendMessageInterval;
        const terminateTimeout = setTimeout(() => {
          console.log("Can't Send Message!");
          clearInterval(sendMessageInterval);
          resolve(true);
        }, 5000);

        sendMessageInterval = setInterval(async () => { 
          const para = document.querySelector('[role="textbox"]')?.querySelector('p');
          if (para) {
            clearTimeout(terminateTimeout);
            clearInterval(sendMessageInterval);
            para.innerText = content.message;
            document.querySelector('input[name="subject"]').value = content.subject;
            document.querySelector('input[name="subject"]').dispatchEvent(new InputEvent('change', {bubbles: true}))
            document.querySelector('[role="textbox"]').dispatchEvent(new InputEvent('input', {bubbles: true}));
            await sleep(2);
            document.querySelector('button[type="submit"]').click();
            resolve(true);
          }
        }, 1000)
       
  
      }
    })
    

  }

  const connect = async () => { 

    return new Promise((resolve, reject) => {
      const eleExists = document.querySelector('[type="connect"]');
      if (eleExists) {
        eleExists.click();

        let connectInterval;
        const terminateTimeout = setTimeout(() => {
          console.log("Can't Connnect!");
          clearInterval(sendMessageInterval);
          resolve(true);
        }, 5000);

        connectInterval = setInterval(async () => { 
          const button = document.querySelector('button[aria-label="Other"]');
          if (button) {
            clearTimeout(terminateTimeout);
            clearInterval(connectInterval);
            button.click();
            await sleep(2);
            document.querySelector('button[aria-label="Connect"]').click();

            await sleep(2);
            
            document.querySelector('button[aria-label="Add a note"]').click();

            await sleep(2);

            // This message should be passed from the API as well i think, only getting yes!
            document.querySelector('textarea').value = "Hi, I would like to connect with you :)";
            document.querySelector('textarea').dispatchEvent(new InputEvent('input', {bubbles: true}));

            document.querySelector('button[aria-label="Send now"]').click();
            resolve(true);
          }
        }, 1000)
       
  
      }
    })
    

  }

  function noNullOrUndef(value, optDefaultVal) {
    const defaultVal = optDefaultVal || "";
    return typeof value === "undefined" || value === null ? defaultVal : value;
  }

  function lazyCopy(inputObj, removeKeys = []) {
    const copied = JSON.parse(JSON.stringify(inputObj));
    removeKeys.forEach((k) => delete copied[k]);
    return copied;
  }

  const maxDaysOfMonth = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  };

  const _liSchemaKeys = {
    profile: "*profile",
    certificates: "*certificationView",
    education: "*educationView",
    workPositions: "*positionView",
    workPositionGroups: "*positionGroupView",
    skills: "*skillView",
    projects: "*projectView",
    attachments: "*summaryTreasuryMedias",
    volunteerWork: "*volunteerExperienceView",
    awards: "*honorView",
    publications: "*publicationView",
  };

  const _liTypeMappings = {
    profile: {
      // There is no tocKey for profile in dash FullProfileWithEntries,
      // due to how entry-point is configured
      tocKeys: ["*profile"],
      types: [
        // regular profileView
        "com.linkedin.voyager.identity.profile.Profile",
        // dash FullProfile
        "com.linkedin.voyager.dash.identity.profile.Profile",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities",
      ],
    },
    languages: {
      tocKeys: ["*languageView", "*profileLanguages"],
      types: ["com.linkedin.voyager.identity.profile.Language"],
    },
    certificates: {
      tocKeys: ["*certificationView", "*profileCertifications"],
      types: ["com.linkedin.voyager.dash.identity.profile.Certification"],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileCertification",
      ],
    },
    education: {
      tocKeys: ["*educationView", "*profileEducations"],
      types: [
        "com.linkedin.voyager.identity.profile.Education",
        // Dash
        "com.linkedin.voyager.dash.identity.profile.Education",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileEducation",
      ],
    },
    courses: {
      tocKeys: ["*courseView", "*profileCourses"],
      types: [
        "com.linkedin.voyager.identity.profile.Course",
        "com.linkedin.voyager.dash.identity.profile.Course",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileCourse",
      ],
    },
    // Individual work entries (not aggregate (workgroup) with date range)
    workPositions: {
      tocKeys: ["*positionView"],
      types: [
        "com.linkedin.voyager.identity.profile.Position",
        "com.linkedin.voyager.dash.identity.profile.Position",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfilePosition",
      ],
    },
    // Work entry *groups*, aggregated by employer clumping
    workPositionGroups: {
      tocKeys: ["*positionGroupView", "*profilePositionGroups"],
      types: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfilePositionGroupsInjection",
      ],
      recipes: [
        "com.linkedin.voyager.identity.profile.PositionGroupView",
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfilePositionGroup",
        // Generic collection response
        "com.linkedin.restli.common.CollectionResponse",
      ],
    },
    skills: {
      tocKeys: ["*skillView", "*profileSkills"],
      types: [
        "com.linkedin.voyager.identity.profile.Skill",
        "com.linkedin.voyager.dash.identity.profile.Skill",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileSkill",
      ],
    },
    projects: {
      tocKeys: ["*projectView", "*profileProjects"],
      types: [
        "com.linkedin.voyager.identity.profile.Project",
        "com.linkedin.voyager.dash.identity.profile.Project",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileProject",
      ],
    },
    attachments: {
      tocKeys: ["*summaryTreasuryMedias", "*profileTreasuryMediaPosition"],
      types: [
        "com.linkedin.voyager.identity.profile.Certification",
        "com.linkedin.voyager.dash.identity.profile.treasury.TreasuryMedia",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileTreasuryMedia",
      ],
    },
    volunteerWork: {
      tocKeys: ["*volunteerExperienceView", "*profileVolunteerExperiences"],
      types: ["com.linkedin.voyager.dash.identity.profile.VolunteerExperience"],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileVolunteerExperience",
      ],
    },
    awards: {
      tocKeys: ["*honorView", "*profileHonors"],
      types: [
        "com.linkedin.voyager.identity.profile.Honor",
        "com.linkedin.voyager.dash.identity.profile.Honor",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfileHonor",
      ],
    },
    publications: {
      tocKeys: ["*publicationView", "*profilePublications"],
      types: [
        "com.linkedin.voyager.identity.profile.Publication",
        "com.linkedin.voyager.dash.identity.profile.Publication",
      ],
      recipes: [
        "com.linkedin.voyager.dash.deco.identity.profile.FullProfilePublication",
      ],
    },
  };

  async function getProfileUrnId(allowFetch = true) {
    const profileViewUrnPatt = /urn:li:fs_profileView:(.+)$/i;

    const endpoint = _voyagerEndpoints.fullProfileView;
    // Make a new API call to get ID - be wary of recursive calls
    if (allowFetch && !endpoint.includes(`{profileUrnId}`)) {
      const fullProfileView = await voyagerFetch(endpoint);
      const profileDb = buildDbFromLiSchema(fullProfileView);
      profileUrnId =
        profileDb.tableOfContents["entityUrn"].match(profileViewUrnPatt)[1];
      return profileUrnId;
    }
    console.warn(
      "Could not scrape profileUrnId from cache, but fetch is disallowed. Might be using a stale ID!"
    );

    // Try to find in DOM, as last resort
    const urnPatt = /miniprofiles\/([A-Za-z0-9-_]+)/g;
    const matches = document.body.innerHTML.match(urnPatt);
    if (matches && matches.length > 1) {
      // eslint-disable-next-line prettier/prettier
      // prettier-ignore
      profileUrnId = (urnPatt.exec(matches[matches.length - 1]))[1];
      return profileUrnId;
    }

    return profileUrnId;
  }

  async function parseViaInternalApiVolunteer() {
    try {
      const volunteerResponses = await this.voyagerFetchAutoPaginate(
        _voyagerEndpoints.dash.profileVolunteerExperiences
      );
      volunteerResponses.forEach((response) => {
        const db = buildDbFromLiSchema(response);
        db.getElementsByType(_liTypeMappings.volunteerWork.types).forEach(
          (volunteerEntry) => {
            parseAndPushVolunteerExperience(volunteerEntry, db);
          }
        );
      });
    } catch (e) {
      this.debugConsole.warn(
        "Error parsing using internal API (Voyager) - Volunteer Entries",
        e
      );
    }
  }

  function parseAndPushVolunteerExperience(volunteerEntryObj, db) {
    const parsedVolunteerWork = {
      organization: volunteerEntryObj.companyName,
      position: volunteerEntryObj.role,
      website: companyLiPageFromCompanyUrn(volunteerEntryObj["companyUrn"], db),
      startDate: "",
      endDate: "",
      summary: volunteerEntryObj.description,
      highlights: [],
    };
    parseAndAttachResumeDates(parsedVolunteerWork, volunteerEntryObj);

    // Push to final json
    output.volunteer.push({
      ...lazyCopy(parsedVolunteerWork, ["website"]),
      url: parsedVolunteerWork.website,
    });
  }

  function parseAndPushEducation(educationObj, db) {
    const edu = educationObj;
    const parsedEdu = {
      institution: noNullOrUndef(edu.schoolName),
      area: noNullOrUndef(edu.fieldOfStudy),
      studyType: noNullOrUndef(edu.degreeName),
      startDate: "",
      endDate: "",
      gpa: noNullOrUndef(edu.grade),
      courses: [],
    };
    parseAndAttachResumeDates(parsedEdu, edu);
    if (Array.isArray(edu.courses)) {
      edu.courses.forEach((courseKey) => {
        const courseInfo = db.entitiesByUrn[courseKey];
        if (courseInfo) {
          parsedEdu.courses.push(`${courseInfo.number} - ${courseInfo.name}`);
        } else {
          console.debugConsole.warn("could not find course:", courseKey);
        }
      });
    } else {
      db.getElementsByType(_liTypeMappings.courses.types).forEach((c) => {
        if (c.occupationUnion && c.occupationUnion.profileEducation) {
          if (c.occupationUnion.profileEducation === edu.entityUrn) {
            parsedEdu.courses.push(`${c.number} - ${c.name}`);
          }
        }
      });
    }
    output.education.push({
      institution: noNullOrUndef(edu.schoolName),
      area: noNullOrUndef(edu.fieldOfStudy),
      studyType: noNullOrUndef(edu.degreeName),
      startDate: parsedEdu.startDate,
      endDate: parsedEdu.endDate,
      score: noNullOrUndef(edu.grade),
      courses: parsedEdu.courses,
    });
  }

  function parseAndAttachResumeDates(resumeObj, liEntity) {
    // Time period can either come as `timePeriod` or `dateRange` prop
    const timePeriod = liEntity.timePeriod || liEntity.dateRange;
    if (timePeriod) {
      const start = timePeriod.startDate || timePeriod.start;
      const end = timePeriod.endDate || timePeriod.end;
      if (end) {
        resumeObj.endDate = parseDate(end);
      }
      if (start) {
        resumeObj.startDate = parseDate(start);
      }
    }
  }

  function parseDate(dateObj) {
    return dateObj && dateObj.year
      ? `${dateObj.year}-${getMonthPadded(dateObj.month)}-${getDayPadded(
          dateObj.day,
          dateObj.month
        )}`
      : "";
  }

  function zeroLeftPad(n) {
    if (n < 10) {
      return `0${n}`;
    }

    return n.toString();
  }

  function getMonthPadded(m) {
    if (!m) return `12`;

    return zeroLeftPad(m);
  }

  function getDayPadded(d, m) {
    if (!d) {
      if (!m) return `31`;
      return maxDaysOfMonth[m].toString();
    }

    return zeroLeftPad(d);
  }

  function companyLiPageFromCompanyUrn(companyUrn, db) {
    if (typeof companyUrn === "string") {
      // Dash
      const company = db.getElementByUrn(companyUrn);
      if (company && company.url) {
        return company.url;
      }

      // profileView
      const linkableCompanyIdMatch = /urn.+Company:(\d+)/.exec(companyUrn);
      if (linkableCompanyIdMatch) {
        return `https://www.linkedin.com/company/${linkableCompanyIdMatch[1]}`;
      }
    }
    return "";
  }

  function getWorkPositions(db) {
    return getElementsThroughGroup(db, {
      multiRootKey: "*profilePositionGroups",
      singleRootVoyagerTypeString:
        "com.linkedin.voyager.dash.identity.profile.PositionGroup",
      elementsInGroupCollectionResponseKey: "*profilePositionInPositionGroup",
      fallbackElementGroupViewKey: "*positionGroupView",
      fallbackElementGroupUrnArrayKey: "*positions",
      fallbackTocKeys: _liTypeMappings.workPositions.tocKeys,
      fallbackTypeStrings: _liTypeMappings.workPositions.types,
    });
  }

  function buildDbFromLiSchema(schemaJson) {
    const possibleResponseDirectUrnArrayKeys = ["*elements", "elements"];
    const entitiesByUrn = {};
    const entities = [];

    for (let x = 0; x < possibleResponseDirectUrnArrayKeys.length; x++) {
      const elementsUrnArr =
        schemaJson.data[possibleResponseDirectUrnArrayKeys[x]];
      if (Array.isArray(elementsUrnArr)) {
        const sorted = [];
        elementsUrnArr.forEach((urn) => {
          const matching = schemaJson.included.find((e) => e.entityUrn === urn);
          if (matching) {
            sorted.push(matching);
          }
        });
        sorted.push(
          ...schemaJson.included.filter(
            (e) => !elementsUrnArr.includes(e.entityUrn)
          )
        );
        schemaJson.included = sorted;
        break;
      }
    }

    for (let x = 0; x < schemaJson.included.length; x++) {
      const currRow = {
        key: schemaJson.included[x].entityUrn,
        ...schemaJson.included[x],
      };
      entitiesByUrn[currRow.entityUrn] = currRow;
      entities.push(currRow);
    }

    const db = {
      entitiesByUrn,
      entities,
      tableOfContents: schemaJson.data,
    };
    delete db.tableOfContents["included"];
    db.getElementKeys = function getElementKeys() {
      for (let x = 0; x < possibleResponseDirectUrnArrayKeys.length; x++) {
        const key = possibleResponseDirectUrnArrayKeys[x];
        const matchingArr = db.tableOfContents[key];
        if (Array.isArray(matchingArr)) {
          return matchingArr;
        }
      }
      return [];
    };
    db.getElements = function getElements() {
      return db.getElementKeys().map((key) => {
        return db.entitiesByUrn[key];
      });
    };
    db.getElementsByType = function getElementByType(typeStr) {
      const typeStrArr = Array.isArray(typeStr) ? typeStr : [typeStr];
      return db.entities.filter(
        (entity) => typeStrArr.indexOf(entity["$type"]) !== -1
      );
    };
    db.getElementByUrn = function getElementByUrn(urn) {
      return db.entitiesByUrn[urn];
    };
    db.getElementsByUrns = function getElementsByUrns(urns) {
      if (typeof urns === "string") {
        urns = [urns];
      }
      return Array.isArray(urns)
        ? urns.map((urn) => db.entitiesByUrn[urn])
        : [];
    };
    db.getValueByKey = function getValueByKey(key) {
      const keyArr = Array.isArray(key) ? key : [key];
      for (let x = 0; x < keyArr.length; x++) {
        const foundVal = db.entitiesByUrn[db.tableOfContents[keyArr[x]]];
        if (foundVal) {
          return foundVal;
        }
      }
      return undefined;
    };
    db.getValuesByKey = function getValuesByKey(key, optTocValModifier) {
      const values = [];
      if (Array.isArray(key)) {
        return values.concat(
          ...key.map((k) => {
            return getValuesByKey(k, optTocValModifier);
          })
        );
      }
      let tocVal = db.tableOfContents[key];
      if (typeof optTocValModifier === "function") {
        tocVal = optTocValModifier(tocVal);
      }
      let matchingDbIndexes = [];
      // Array of direct keys to sub items
      if (Array.isArray(tocVal)) {
        matchingDbIndexes = tocVal;
      }
      // String pointing to sub item
      else if (tocVal) {
        const subToc = entitiesByUrn[tocVal];
        // Needs secondary lookup if has elements property with list of keys pointing to other sub items
        if (subToc["*elements"] && Array.isArray(subToc["*elements"])) {
          matchingDbIndexes = subToc["*elements"];
        }
        // Sometimes they use 'elements' instead of '*elements"...
        else if (subToc["elements"] && Array.isArray(subToc["elements"])) {
          matchingDbIndexes = subToc["elements"];
        } else {
          // The object itself should be the return row
          values.push(subToc);
        }
      }
      for (let x = 0; x < matchingDbIndexes.length; x++) {
        if (typeof entitiesByUrn[matchingDbIndexes[x]] !== "undefined") {
          values.push(entitiesByUrn[matchingDbIndexes[x]]);
        }
      }
      return values;
    };
    return db;
  }

  function parseAndPushPosition(positionObj, db) {
    const parsedWork = {
      company: positionObj.companyName,
      endDate: "",
      highlights: [],
      position: positionObj.title,
      startDate: "",
      summary: positionObj.description,
      website: companyLiPageFromCompanyUrn(positionObj["companyUrn"], db),
    };
    parseAndAttachResumeDates(parsedWork, positionObj);
    // Lookup company website
    if (positionObj.company && positionObj.company["*miniCompany"]) {
      // @TODO - website is not in schema. Use voyager?
      // let companyInfo = db.data[position.company['*miniCompany']];
    }

    // Push to final json
    output.work.push({
      name: parsedWork.company,
      position: parsedWork.position,
      // This is description of company, not position
      // description: '',
      startDate: parsedWork.startDate,
      endDate: parsedWork.endDate,
      highlights: parsedWork.highlights,
      summary: parsedWork.summary,
      url: parsedWork.website,
      location: positionObj.locationName,
    });
  }

  function getElementsThroughGroup(
    db,
    {
      multiRootKey,
      singleRootVoyagerTypeString,
      elementsInGroupCollectionResponseKey,
      fallbackElementGroupViewKey,
      fallbackElementGroupUrnArrayKey,
      fallbackTocKeys,
      fallbackTypeStrings,
    }
  ) {
    const rootElements = db.getElements() || [];
    /** @type {LiEntity[]} */
    let finalEntities = [];

    /**
     * There are multiple ways that ordered / grouped elements can be nested within a profileView, or other data structure
     * Using example of work positions:
     *  A) **ROOT** -> *profilePositionGroups -> PositionGroup[] -> *profilePositionInPositionGroup (COLLECTION) -> Position[]
     *  B) **ROOT** -> *positionGroupView -> PositionGroupView -> PositionGroup[] -> *positions -> Position[]
     */

    // This is route A - longest recursion chain
    // profilePositionGroup responses are a little annoying; the direct children don't point directly to position entities
    // Instead, you have to follow path of `profilePositionGroup` -> `*profilePositionInPositionGroup` -> `*elements` -> `Position`
    // You can bypass by looking up by `Position` type, but then original ordering is not preserved
    let profileElementGroups = db.getValuesByKey(multiRootKey);
    // Check for voyager profilePositionGroups response, where all groups are direct children of root element
    if (
      !profileElementGroups.length &&
      rootElements.length &&
      rootElements[0].$type === singleRootVoyagerTypeString
    ) {
      profileElementGroups = rootElements;
    }
    profileElementGroups.forEach((pGroup) => {
      // This element (profileElementsGroup) is one way how LI groups positions
      // - Instead of storing *elements (positions) directly,
      // there is a pointer to a "collection" that has to be followed
      /** @type {string | string[] | undefined} */
      const profilePositionInGroupCollectionUrns =
        pGroup[elementsInGroupCollectionResponseKey];
      if (profilePositionInGroupCollectionUrns) {
        const positionCollections = db.getElementsByUrns(
          profilePositionInGroupCollectionUrns
        );
        // Another level... traverse collections
        positionCollections.forEach((collection) => {
          // Final lookup via standard collection['*elements']
          finalEntities = finalEntities.concat(
            db.getElementsByUrns(collection["*elements"] || [])
          );
        });
      }
    });

    if (
      !finalEntities.length &&
      !!fallbackElementGroupViewKey &&
      !!fallbackElementGroupUrnArrayKey
    ) {
      db.getValuesByKey(fallbackElementGroupViewKey).forEach((pGroup) => {
        finalEntities = finalEntities.concat(
          db.getElementsByUrns(pGroup[fallbackElementGroupUrnArrayKey] || [])
        );
      });
    }

    if (!finalEntities.length && !!fallbackTocKeys) {
      // Direct lookup - by main TOC keys
      finalEntities = db.getValuesByKey(fallbackTocKeys);
    }

    if (!finalEntities.length && !!fallbackTypeStrings) {
      // Direct lookup - by type
      finalEntities = db.getElementsByType(fallbackTypeStrings);
    }

    return finalEntities;
  }

  function setQueryParams(url, paramPairs) {
    const urlInstance = new URL(url);
    /** @type {Record<string, any>} */
    const existingQueryPairs = {};
    urlInstance.searchParams.forEach((val, key) => {
      existingQueryPairs[key] = val;
    });
    urlInstance.search = new URLSearchParams({
      ...existingQueryPairs,
      ...paramPairs,
    }).toString();
    return urlInstance.toString();
  }

  async function voyagerFetchAutoPaginate(
    fetchEndpoint,
    optHeaders = {},
    start = 0,
    limitPerPage = 20,
    requestLimit = 100,
    throttleDelayMs = 100
  ) {
    const responseArr = [];
    let url = await formatVoyagerUrl(fetchEndpoint);
    let done = false;
    let currIndex = start;
    let requestsMade = 0;
    let resolver;
    let rejector;

    const handlePagingData = (pagingObj) => {
      if (pagingObj && typeof pagingObj === "object" && "total" in pagingObj) {
        currIndex = pagingObj.start + pagingObj.count;
        done = currIndex >= pagingObj.total;
      } else {
        done = true;
      }
    };

    const handleResponse = async (liResponse) => {
      requestsMade++;
      responseArr.push(liResponse);
      handlePagingData(liResponse.data.paging);
      if (!done && requestsMade < requestLimit) {
        await new Promise((res) => {
          setTimeout(() => {
            res();
          }, throttleDelayMs);
        });
        url = setQueryParams(url, {
          start: currIndex,
          count: limitPerPage,
        });
        try {
          const response = await voyagerFetch(url, optHeaders);
          // Recurse
          handleResponse(response);
        } catch (e) {
          // BAIL
          done = true;
          console.warn(`Bailing out of auto-fetch, request failed.`, e);
        }
      } else {
        done = true;
      }

      if (done) {
        if (responseArr.length) {
          resolver(responseArr);
        } else {
          rejector(new Error(`Failed to make any requests`));
        }
      }
    };

    // Start off the pagination chain
    voyagerFetch(
      setQueryParams(url, {
        start: currIndex,
        count: limitPerPage,
      })
    ).then(handleResponse);

    return new Promise((res, rej) => {
      resolver = res;
      rejector = rej;
    });
  }

  const resumeJsonTemplateStable = {
    basics: {
      name: "",
      headline: "",
      image: "",
      backgroundImage: "",
      email: "",
      phone: "",
      location: "",
      followers: "",
      connections: "",
      url: "",
      summary: "",
      location: "",
      profiles: [],
    },
    work: [],
    volunteer: [],
    education: [],
    awards: [],
    certificates: [],
    publications: [],
    skills: [],
    languages: [],
    recommendations: [],
    projects: [],
  };

  const output = JSON.parse(JSON.stringify(resumeJsonTemplateStable));

  async function voyagerFetch(fetchEndpoint, optHeaders = {}) {
    const endpoint = await formatVoyagerUrl(fetchEndpoint);
    return new Promise((resolve, reject) => {
      // Get the csrf token - should be stored as a cookie
      const csrfTokenString = getCookie("JSESSIONID").replace(/"/g, "");
      if (csrfTokenString) {
        /** @type {RequestInit} */
        const fetchOptions = {
          credentials: "include",
          headers: {
            ...optHeaders,
            accept: "application/vnd.linkedin.normalized+json+2.1",
            "csrf-token": csrfTokenString,
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
          },
          referrer: document.location.href,
          body: null,
          method: "GET",
          mode: "cors",
        };
        fetch(endpoint, fetchOptions).then((response) => {
          if (response.status !== 200) {
            const errStr = "Error fetching internal API endpoint";
            reject(new Error(errStr));
            console.warn(errStr, response);
          } else {
            response.text().then((text) => {
              try {
                const parsed = JSON.parse(text);
                resolve(parsed);
              } catch (e) {
                console.warn(
                  "Error parsing internal API response",
                  response,
                  e
                );
                reject(e);
              }
            });
          }
        });
      } else {
        reject(new Error("Could not find valid LI cookie"));
      }
    });
  }

  async function parseViaInternalApiFullSkills() {
    try {
      const fullSkillsInfo = await voyagerFetch(_voyagerEndpoints.fullSkills);
      if (fullSkillsInfo && typeof fullSkillsInfo.data === "object") {
        if (Array.isArray(fullSkillsInfo.included)) {
          for (let x = 0; x < fullSkillsInfo.included.length; x++) {
            const skillObj = fullSkillsInfo.included[x];
            if (typeof skillObj.name === "string") {
              pushSkill(skillObj.name);
            }
          }
        }
        return true;
      }
    } catch (e) {
      console.warn(
        "Error parsing using internal API (Voyager) - FullSkills",
        e
      );
    }
    return false;
  }

  async function parseViaInternalApiBasicAboutMe() {
    try {
      const basicAboutMe = await voyagerFetch(_voyagerEndpoints.basicAboutMe);
      if (basicAboutMe && typeof basicAboutMe.data === "object") {
        if (
          Array.isArray(basicAboutMe.included) &&
          basicAboutMe.included.length > 0
        ) {
          const data = basicAboutMe.included[0];
          const partialBasics = {
            name: `${data.firstName} ${data.LastName}`,
            label: data.occupation,
          };
          output.basics = {
            ...output.basics,
            ...partialBasics,
          };
        }
        return true;
      }
    } catch (e) {
      console.warn(
        "Error parsing using internal API (Voyager) - Basic About Me",
        e
      );
    }
    return false;
  }

  async function parseViaInternalApiEducation() {
    try {
      const fullDashProfileObj = await voyagerFetch(
        _voyagerEndpoints.dash.fullProfile.path
      );
      const db = buildDbFromLiSchema(fullDashProfileObj);
      // Response is missing ToC, so just look up by namespace / schema
      const eduEntries = db.getElementsByType(
        "com.linkedin.voyager.dash.identity.profile.Education"
      );
      eduEntries.forEach((edu) => {
        parseAndPushEducation(edu, db, this);
      });
    } catch (e) {
      console.warn("Error parsing using internal API (Voyager) - Education", e);
    }
  }

  async function parseViaInternalApiContactInfo() {
    try {
      const contactInfo = await voyagerFetch(_voyagerEndpoints.contactInfo);
      if (contactInfo && typeof contactInfo.data === "object") {
        const { websites, twitterHandles, phoneNumbers, emailAddress } =
          contactInfo.data;
        const partialBasics = {};
        partialBasics.email = noNullOrUndef(emailAddress, output.basics.email);
        if (phoneNumbers && phoneNumbers.length) {
          partialBasics.phone = noNullOrUndef(phoneNumbers[0].number);
        }
        output.basics = {
          ...output.basics,
          ...partialBasics,
        };

        if (Array.isArray(websites)) {
          for (let x = 0; x < websites.length; x++) {
            if (/portfolio/i.test(websites[x].type.category)) {
              output.basics.website = websites[x].url;
            }
          }
        }

        if (Array.isArray(twitterHandles)) {
          twitterHandles.forEach((handleMeta) => {
            const handle = handleMeta.name;
            const formattedProfile = {
              network: "Twitter",
              username: handle,
              url: `https://twitter.com/${handle}`,
            };
            output.basics.profiles.push(formattedProfile);
          });
        }
        return true;
      }
    } catch (e) {
      console.warn(
        "Error parsing using internal API (Voyager) - Contact Info",
        e
      );
    }
    return false;
  }

  async function parseViaInternalApiAdvancedAboutMe() {
    try {
      const advancedAboutMe = await voyagerFetch(
        _voyagerEndpoints.advancedAboutMe
      );
      if (advancedAboutMe && typeof advancedAboutMe.data === "object") {
        const { data } = advancedAboutMe;
        const partialBasics = {
          name: `${data.firstName} ${data.lastName}`,
          headline: data.headline,
          summary: data.summary,
          location: data.geoLocationName,
        };
        output.basics = {
          ...output.basics,
          ...partialBasics,
        };
        return true;
      }
    } catch (e) {
      console.warn(
        "Error parsing using internal API (Voyager) - AdvancedAboutMe",
        e
      );
    }
    return false;
  }

  async function parseViaInternalApiRecommendations() {
    try {
      const recommendationJson = await voyagerFetch(
        `${_voyagerEndpoints.recommendations}?q=received&recommendationStatuses=List(VISIBLE)`
      );
      const db = buildDbFromLiSchema(recommendationJson);
      db.getElementKeys().forEach((key) => {
        const elem = db.entitiesByUrn[key];
        if (elem && "recommendationText" in elem) {
          // Need to do a secondary lookup to get the name of the person who gave the recommendation
          const recommenderElem = db.entitiesByUrn[elem["*recommender"]];
          const formattedReference = {
            name: `${recommenderElem.firstName} ${recommenderElem.lastName}`,
            reference: elem.recommendationText,
          };
          output.recommendations.push(formattedReference);
        }
      });
    } catch (e) {
      console.warn(
        "Error parsing using internal API (Voyager) - Recommendations",
        e
      );
    }
    return false;
  }
  async function parseViaInternalApiWork() {
    try {
      const workResponses = await voyagerFetchAutoPaginate(
        _voyagerEndpoints.dash.profilePositionGroups.path
      );
      workResponses.forEach((response) => {
        const db = buildDbFromLiSchema(response);
        getWorkPositions(db).forEach((position) => {
          parseAndPushPosition(position, db);
        });
      });
    } catch (e) {
      console.warn("Error parsing using internal API (Voyager) - Work", e);
    }
  }

  function pushSkill(skillName) {
    const skillNames = output.skills.map((skill) => skill.name);
    if (skillNames.indexOf(skillName) === -1) {
      const formattedSkill = {
        name: skillName,
        level: "",
        keywords: [],
      };
      output.skills.push(formattedSkill);
    }
  }

  function getCookie(name) {
    const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
    return v ? v[2] : null;
  }

  const _voyagerBase = "https://www.linkedin.com/voyager/api";
  const _voyagerEndpoints = {
    following: "/identity/profiles/{profileId}/following",
    followingCompanies:
      "/identity/profiles/{profileId}/following?count=10&entityType=COMPANY&q=followedEntities",
    contactInfo: "/identity/profiles/{profileId}/profileContactInfo",
    basicAboutMe: "/me",
    advancedAboutMe: "/identity/profiles/{profileId}",
    fullProfileView: "/identity/profiles/{profileId}/profileView",
    fullSkills: "/identity/profiles/{profileId}/skillCategory",
    recommendations: "/identity/profiles/{profileId}/recommendations",
    dash: {
      profilePositionGroups: {
        path: "/identity/dash/profilePositionGroups?q=viewee&profileUrn=urn:li:fsd_profile:{profileUrnId}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfilePositionGroup-50",
        template:
          "/identity/dash/profilePositionGroups?q=viewee&profileUrn=urn:li:fsd_profile:{profileUrnId}&decorationId={decorationId}",
        recipe:
          "com.linkedin.voyager.dash.deco.identity.profile.FullProfilePositionGroup",
      },
      fullProfile: {
        path: "/identity/dash/profiles?q=memberIdentity&memberIdentity={profileId}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-93",
        template:
          "/identity/dash/profiles?q=memberIdentity&memberIdentity={profileId}&decorationId={decorationId}",
        recipe:
          "com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities",
      },
      profileVolunteerExperiences:
        "/identity/dash/profileVolunteerExperiences?q=viewee&profileUrn=urn:li:fsd_profile:{profileUrnId}",
    },
  };

  function getProfileId() {
    let profileId = "";
    const linkedProfileRegUrl = /linkedin.com\/in\/([^\/?#]+)[\/?#]?.*$/im;
    const linkedProfileRegApi = /voyager\/api\/.*\/profiles\/([^\/]+)\/.*/im;
    if (linkedProfileRegUrl.test(document.location.href)) {
      profileId = linkedProfileRegUrl.exec(document.location.href)[1];
    }
    if (!profileId && linkedProfileRegApi.test(document.body.innerHTML)) {
      profileId = linkedProfileRegApi.exec(document.body.innerHTML)[1];
    }

    // In case username contains special characters
    return profileId;
  }

  async function formatVoyagerUrl(fetchEndpoint) {
    let endpoint = fetchEndpoint;
    if (endpoint.includes("{profileId}")) {
      endpoint = fetchEndpoint.replace(/{profileId}/g, getProfileId());
    }
    if (endpoint.includes("{profileUrnId}")) {
      const profileUrnId = await getProfileUrnId();
      endpoint = endpoint.replace(/{profileUrnId}/g, profileUrnId);
    }
    if (!endpoint.startsWith("https")) {
      endpoint = _voyagerBase + endpoint;
    }
    return endpoint;
  }

  async function parseProfileSchemaJSON(liResponse, endpoint = "profileView") {
    const dash = endpoint === "dashFullProfileWithEntities";
    let foundGithub = false;
    const foundPortfolio = false;
    const resultSummary = {
      liResponse,
      profileSrc: endpoint,
      pageUrl: null,
      parseSuccess: false,
      sections: {
        basics: "fail",
        languages: "fail",
        attachments: "fail",
        education: "fail",
        work: "fail",
        volunteer: "fail",
        certificates: "fail",
        skills: "fail",
        projects: "fail",
        awards: "fail",
        publications: "fail",
      },
    };
    try {
      // Build db object
      let db = buildDbFromLiSchema(liResponse);

      if (dash && !liResponse.data.hoisted) {
        const profileObj = db.getElementByUrn(
          db.tableOfContents["*elements"][0]
        );
        if (!profileObj || !profileObj.firstName) {
          throw new Error(
            "Could not extract nested profile object from Dash endpoint"
          );
        }
        const hoistedRes = {
          data: {
            ...liResponse.data,
            ...profileObj,
            // Set flag for future
            hoisted: true,
          },
          included: liResponse.included,
        };
        resultSummary.liResponse = hoistedRes;
        db = buildDbFromLiSchema(hoistedRes);
      }

      // Parse basics / profile
      let profileGrabbed = false;
      const profileObjs = dash
        ? [db.getElementByUrn(db.tableOfContents["*elements"][0])]
        : db.getValuesByKey(_liSchemaKeys.profile);
      profileObjs.forEach((profile) => {
        // There should only be one
        if (!profileGrabbed) {
          profileGrabbed = true;
          resultSummary.profileInfoObj = profile;
          const localeObject = !dash
            ? profile.defaultLocale
            : profile.primaryLocale;
          const formattedProfileObj = {
            name: `${profile.firstName} ${profile.lastName}`,
            summary: noNullOrUndef(profile.summary),
            headline: noNullOrUndef(profile.headline),
            location: {
              countryCode: localeObject.country,
            },
            url: document.location.href,
          };
          if (profile.address) {
            formattedProfileObj.location.address = noNullOrUndef(
              profile.address
            );
          } else if (profile.locationName) {
            formattedProfileObj.location.address = noNullOrUndef(
              profile.locationName
            );
          }
          output.basics = {
            ...output.basics,
            ...formattedProfileObj,
          };

          const formatttedLang = {
            language:
              localeObject.language.toLowerCase() === "en"
                ? "English"
                : localeObject.language,
            fluency: "Native Speaker",
          };
          output.languages.push(formatttedLang);
          resultSummary.sections.basics = "success";

          const parsedLocaleStr = `${localeObject.language}_${localeObject.country}`;
          resultSummary.localeStr = parsedLocaleStr;
        }
      });

      const followers = Array.from(document.querySelectorAll("span"))
        .find((el) => el.textContent.includes("followers"))
        ?.innerText.split(" ")[0];

      const connections = Array.from(document.querySelectorAll("span"))
        .find((el) => el.textContent.includes("connections"))
        ?.innerText.split(" ")[0];

      const degreeConnection = document
        .querySelector('[aria-label*="degree"]')
        ?.textContent.trim()
        .split(" ")[0];

      if (followers) {
        output.basics.followers = followers;
      }

      if (connections) {
        output.basics.connections = connections;
      }

      if (degreeConnection) {
        output.basics.degreeConnection = degreeConnection;
      }

      await parseViaInternalApiContactInfo();

      let languages = [];
      const languageElements = db.getValuesByKey(
        _liTypeMappings.languages.tocKeys
      );
      languageElements.forEach((languageMeta) => {
        const liProficiencyEnumToJsonResumeStr = {
          NATIVE_OR_BILINGUAL: "Native Speaker",
          FULL_PROFESSIONAL: "Full Professional",
          EXPERT: "Expert",
          ADVANCED: "Advanced",
          PROFESSIONAL_WORKING: "Professional Working",
          LIMITED_WORKING: "Limited Working",
          INTERMEDIATE: "intermediate",
          BEGINNER: "Beginner",
          ELEMENTARY: "Elementary",
        };
        const liProficiency =
          typeof languageMeta.proficiency === "string"
            ? languageMeta.proficiency.toUpperCase()
            : undefined;
        if (
          liProficiency &&
          liProficiency in liProficiencyEnumToJsonResumeStr
        ) {
          languages.push({
            fluency: liProficiencyEnumToJsonResumeStr[liProficiency],
            language: languageMeta.name,
          });
        }
      });
      languages = [
        ...output.languages.filter((e) => {
          return !languages.find((l) => l.language === e.language);
        }),
        ...languages,
      ];
      output.languages = languages;
      resultSummary.sections.languages = languages.length ? "success" : "empty";

      // Parse attachments / portfolio links
      const attachments = db.getValuesByKey(
        _liTypeMappings.attachments.tocKeys
      );
      attachments.forEach((attachment) => {
        let captured = false;
        const url = attachment.data.url || attachment.data.Url;
        if (
          attachment.providerName === "GitHub" ||
          /github\.com/gim.test(url)
        ) {
          const usernameMatch = /github\.com\/([^\/\?]+)[^\/]+$/gim.exec(url);
          if (usernameMatch && !foundGithub) {
            foundGithub = true;
            captured = true;
            const formattedProfile = {
              network: "GitHub",
              username: usernameMatch[1],
              url,
            };
            output.basics.profiles.push(formattedProfile);
          }
        }
        // Since most people put potfolio as first link, guess that it will be
        if (!captured && !foundPortfolio) {
          captured = true;
          output.basics.website = url;
          output.basics.url = url;
        }
        // Finally, put in projects if not yet categorized
        if (!captured) {
          captured = true;
          output.projects = output.projects || [];
          output.projects.push({
            name: attachment.title || attachment.mediaTitle,
            startDate: "",
            endDate: "",
            description: attachment.description || attachment.mediaDescription,
            url,
          });
        }
      });
      resultSummary.sections.attachments = attachments.length
        ? "success"
        : "empty";

      // Parse education

      await parseViaInternalApiEducation();
      resultSummary.sections.education = output.education.length
        ? "success"
        : "empty";

      let allWorkCanBeCaptured = true;
      const views = [
        _liTypeMappings.workPositionGroups.tocKeys,
        _liTypeMappings.workPositions.tocKeys,
      ].map(db.getValueByKey);
      for (let x = 0; x < views.length; x++) {
        const view = views[x];
        if (view && view.paging) {
          const { paging } = view;
          if (paging.start + paging.count >= paging.total !== true) {
            allWorkCanBeCaptured = false;
            break;
          }
        }
      }
      if (allWorkCanBeCaptured) {
        getWorkPositions(db).forEach((position) => {
          parseAndPushPosition(position, db);
        });
        console.log(
          `All work positions captured directly from profile result.`
        );
        resultSummary.sections.work = "success";
      } else {
        console.warn(`Work positions in profile are truncated.`);
        await parseViaInternalApiWork();
      }

      let allVolunteerCanBeCaptured = true;
      const volunteerView = db.getValueByKey([
        ..._liTypeMappings.volunteerWork.tocKeys,
      ]);
      if (volunteerView.paging) {
        const { paging } = volunteerView;
        allVolunteerCanBeCaptured = paging.start + paging.count >= paging.total;
      }
      if (allVolunteerCanBeCaptured) {
        const volunteerEntries = db.getValuesByKey(
          _liTypeMappings.volunteerWork.tocKeys
        );
        volunteerEntries.forEach((volunteering) => {
          parseAndPushVolunteerExperience(volunteering, db);
        });
        resultSummary.sections.volunteer = volunteerEntries.length
          ? "success"
          : "empty";
      } else {
        await parseViaInternalApiVolunteer();
      }

      const certificates = [];
      db.getValuesByKey(_liTypeMappings.certificates.tocKeys).forEach(
        (cert) => {
          const certObj = {
            name: cert.name,
            issuer: cert.authority,
          };
          parseAndAttachResumeDates(certObj, cert);
          if (typeof cert.url === "string" && cert.url) {
            certObj.url = cert.url;
          }
          certificates.push(certObj);
        }
      );
      resultSummary.sections.certificates = certificates.length
        ? "success"
        : "empty";
      output.certificates = certificates;

      // Parse skills
      await parseViaInternalApiFullSkills();
      resultSummary.sections.skills = output.skills.length
        ? "success"
        : "empty";

      // Parse projects
      output.projects = output.projects || [];
      db.getValuesByKey(_liTypeMappings.projects.tocKeys).forEach((project) => {
        const parsedProject = {
          name: project.title,
          startDate: "",
          summary: project.description,
          url: project.url,
        };
        parseAndAttachResumeDates(parsedProject, project);
        output.projects.push(parsedProject);
      });
      resultSummary.sections.projects = output.projects.length
        ? "success"
        : "empty";

      // Parse awards
      const awardEntries = db.getValuesByKey(_liTypeMappings.awards.tocKeys);
      awardEntries.forEach((award) => {
        const parsedAward = {
          title: award.title,
          date: "",
          awarder: award.issuer,
          summary: noNullOrUndef(award.description),
        };
        // profileView vs dash key
        const issueDateObject = award.issueDate || award.issuedOn;
        if (issueDateObject && typeof issueDateObject === "object") {
          parsedAward.date = parseDate(issueDateObject);
        }
        output.awards.push(parsedAward);
      });
      resultSummary.sections.awards = awardEntries.length ? "success" : "empty";

      // Parse publications
      const publicationEntries = db.getValuesByKey(
        _liTypeMappings.publications.tocKeys
      );
      publicationEntries.forEach((publication) => {
        const parsedPublication = {
          name: publication.name,
          publisher: publication.publisher,
          releaseDate: "",
          website: noNullOrUndef(publication.url),
          summary: noNullOrUndef(publication.description),
        };
        // profileView vs dash key
        const publicationDateObj = publication.date || publication.publishedOn;
        if (
          publicationDateObj &&
          typeof publicationDateObj === "object" &&
          typeof publicationDateObj.year !== "undefined"
        ) {
          parsedPublication.releaseDate = parseDate(publicationDateObj);
        }
        output.publications.push({
          ...lazyCopy(parsedPublication, ["website"]),
          url: parsedPublication.website,
        });
      });
      resultSummary.sections.publications = publicationEntries.length
        ? "success"
        : "empty";

      parseSuccess = true;
      resultSummary.parseSuccess = true;
      resultSummary.pageUrl = getUrlWithoutQuery();
    } catch (e) {
      resultSummary.parseSuccess = false;
    }
    return resultSummary;
  }

  const profileResponse = await voyagerFetch(_voyagerEndpoints.fullProfileView);
  await parseProfileSchemaJSON(profileResponse);
  
  console.log(output);

  if (currentResponse?.message.message) {
    await sendMessage(currentResponse?.message);
    console.log("Message Process Completed!");
  }

  if (currentResponse?.connect == "yes") {
    await connect();
    console.log("Connection Process Completed!");
  }

  const response = await postResponse(output);

  if (response.next_url) {
    //window.open(response.next_url, "_self");
  } else {
    console.log("No More Next Urls!");
    chrome.storage.local.set({ 
      scrape: false
    })
  }

})();

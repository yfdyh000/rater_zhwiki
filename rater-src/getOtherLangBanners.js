import API, { makeErrorMsg } from "./api";
import config from "./config";
import { parseTemplates } from "./Template";
// <nowiki>

/**
 * 获取其他语言版本的条目标题
 * @param {string} pageTitle - 当前页面标题
 * @param {string} langCode - 目标语言代码
 * @returns {Promise<string|null>} 其他语言版本的条目标题，如果不存在则返回null
 */
function getOtherLangTitle(pageTitle, langCode) {
    return API.get({
        action: "query",
        titles: pageTitle,
        prop: "langlinks|pageprops",
        ppprop: "wikibase_item",
        lllang: langCode,
        format: "json"
    }).then(response => {
        const pages = response.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        if (page.langlinks && page.langlinks.length > 0) {
            return page.langlinks[0]["*"];
        }
        const itemId = page.pageprops && page.pageprops.wikibase_item;
        const wikidataApi = new mw.ForeignApi("https://www.wikidata.org/w/api.php");
        // 校验实体确实连接到当前页面，再取目标语言标题，避免命中无关条目
        const getTargetFromEntity = entity => {
            if (!entity || !entity.sitelinks) {
                return null;
            }
            const zhwikiLink = entity.sitelinks.zhwiki;
            if (!zhwikiLink || zhwikiLink.title !== pageTitle) {
                return null;
            }
            const targetLink = entity.sitelinks[langCode + "wiki"];
            return targetLink ? targetLink.title : null;
        };
        const getTargetFromEntities = entityResponse => {
            const entities = entityResponse.entities || {};
            return getTargetFromEntity(entities[Object.keys(entities)[0]]);
        };
        // 回退：langlinks 表缺失时，从 Wikidata 按实体 ID 或按 zhwiki 标题解析实体
        const entityRequest = itemId
            ? wikidataApi.get({
                action: "wbgetentities",
                ids: itemId,
                props: "sitelinks",
                format: "json"
            })
            : wikidataApi.get({
                action: "wbgetentities",
                sites: "zhwiki",
                titles: pageTitle,
                props: "sitelinks",
                format: "json"
            });
        return entityRequest.then(getTargetFromEntities).catch(error => {
            console.warn("[Rater] " + makeErrorMsg("error", "从 Wikidata 获取" + langCode + "维基标题失败: " + error));
            return null;
        });
    }).catch(error => {
        console.warn("[Rater] " + makeErrorMsg(error, "获取其他语言版本条目失败"));
        return null;
    });
}

/**
 * 获取页面讨论页的内容
 * @param {string} pageTitle - 页面标题
 * @param {string} langCode - 语言代码
 * @returns {Promise<string|null>} 讨论页内容，如果不存在则返回null
 */
function getTalkPageContent(pageTitle, langCode) {
    // 确定讨论页标题
    const talkTitle = `Talk:${pageTitle}`;
    
    // 使用mw.ForeignApi来处理跨域请求
    const foreignApi = new mw.ForeignApi(`https://${langCode}.wikipedia.org/w/api.php`);
    
    return foreignApi.get({
        action: "query",
        prop: "revisions",
        titles: talkTitle,
        rvprop: "content",
        rvslots: "main",
        format: "json"
    }).then(response => {
        const pages = response.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId === "-1" || !pages[pageId].revisions) {
            return null;
        }
        
        return pages[pageId].revisions[0].slots.main["*"];
    }).catch(error => {
        console.warn("[Rater] " + makeErrorMsg("error", `获取${langCode}维基讨论页内容失败: ${error}`));
        return null;
    });
}

/**
 * 从讨论页内容中解析维基专题横幅，包括banner shell中嵌套的横幅
 * @param {string} talkPageContent - 讨论页内容
 * @returns {Array<string>} 专题横幅模板名称列表
 */
function parseProjectBanners(talkPageContent) {
    if (!talkPageContent) return [];
    
    const templates = parseTemplates(talkPageContent);
    const bannerNames = [];
    
    // 遍历所有模板
    templates.forEach(template => {
        const name = template.name.trim();
        
        // 检查是否是WikiProject banner shell
        if (name === "WikiProject banner shell" || 
            name.toLowerCase() === "wikiproject banner shell" ||
            config.shellTemplates.includes(name)) {
            
            // 查找参数1中的内容，它包含嵌套的专题横幅
            const param1 = template.getParam("1");
            if (param1 && param1.value) {
                // 解析参数1中的模板
                const nestedTemplates = parseTemplates(param1.value);
                nestedTemplates.forEach(nestedTemplate => {
                    const nestedName = nestedTemplate.name.trim();
                    if (nestedName.includes("WikiProject") || 
                        nestedName.includes("wikiproject")) {
                        bannerNames.push(nestedName);
                    }
                });
            }
        } 
        // 检查顶层的WikiProject模板
        else if (name.includes("WikiProject") || 
                 name.includes("wikiproject")) {
            bannerNames.push(name);
        }
    });
    
    return [...new Set(bannerNames)]; // 移除重复项
}

/**
 * 获取模板对应的其他语言版本
 * @param {string} templateName - 模板名称（不含Template:前缀）
 * @param {string} fromLang - 源语言代码
 * @param {string} toLang - 目标语言代码
 * @returns {Promise<string|null>} 对应的其他语言版模板名，如果不存在则返回null
 */
function getTemplateInOtherLang(templateName, fromLang, toLang) {
    const fullTemplateName = `Template:${templateName}`;
    
    // 使用mw.ForeignApi来处理跨域请求
    const foreignApi = new mw.ForeignApi(`https://${fromLang}.wikipedia.org/w/api.php`);
    
    return foreignApi.get({
        action: "query",
        titles: fullTemplateName,
        prop: "langlinks",
        lllang: toLang,
        format: "json"
    }).then(response => {
        const pages = response.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId === "-1" || !pages[pageId].langlinks || pages[pageId].langlinks.length === 0) {
            return null;
        }
        
        // 返回不含"Template:"前缀的模板名
        const fullTargetName = pages[pageId].langlinks[0]["*"];
        return fullTargetName.replace(/^(Template:|模板:|模板:)?/, "");
    }).catch(error => {
        console.warn("[Rater] " + makeErrorMsg("error", `获取${fromLang}维基模板${templateName}对应的${toLang}版本失败: ${error}`));
        return null;
    });
}

/**
 * 批量获取多个模板在其他语言维基中的对应名称
 * @param {Array<string>} templateNames - 模板名称列表（不含"Template:"前缀）
 * @param {string} fromLang - 源语言代码
 * @param {string} toLang - 目标语言代码
 * @returns {Promise<Array<{name: string, sourceTemplate: string}>>} 对应的模板名称列表
 */
function getTemplatesInOtherLang(templateNames, fromLang, toLang) {
    if (templateNames.length === 0) {
        return Promise.resolve([]);
    }
    // TODO: 可在此加入短时缓存（如按 `${fromLang}:${templateNames.join("|")}` 存储到项目 cache 模块），
    // 减少重复获取时的跨域请求；注意横幅变化时可能需设置较短的缓存有效期。
    const fullNames = templateNames.map(name => `Template:${name}`);
    const foreignApi = new mw.ForeignApi(`https://${fromLang}.wikipedia.org/w/api.php`);
    return foreignApi.get({
        action: "query",
        titles: fullNames.join("|"),
        prop: "langlinks",
        lllang: toLang,
        redirects: 1,
        format: "json"
    }).then(response => {
        const langlinksByTitle = {};
        Object.values(response.query.pages || {}).forEach(page => {
            langlinksByTitle[page.title] = page.langlinks || [];
        });
        // 处理模板重定向，使重定向源也能匹配到目标页的语言链接
        (response.query.redirects || []).forEach(redir => {
            if (langlinksByTitle[redir.to] && !langlinksByTitle[redir.from]) {
                langlinksByTitle[redir.from] = langlinksByTitle[redir.to];
            }
        });
        return templateNames.map(name => {
            const langlinks = langlinksByTitle[`Template:${name}`] || [];
            if (langlinks.length === 0) {
                return null;
            }
            return {
                name: langlinks[0]["*"].replace(/^(Template:|模板:|模板:)?/, ""),
                sourceTemplate: name
            };
        }).filter(item => item !== null);
    }).catch(error => {
        console.warn("[Rater] " + makeErrorMsg("error", `批量获取${fromLang}维基模板对应的${toLang}版本失败: ${error}`));
        return [];
    });
}

/**
 * 获取其他语言的专题横幅
 * @param {string} pageTitle - 当前条目标题
 * @param {string} langCode - 目标语言代码
 * @returns {Promise<Array<Object>>} 中文版横幅模板对象列表，包含名称和来源信息
 */
function getOtherLangProjectBanners(pageTitle, langCode) {
    // 修改为使用普通Promise，避免async/await可能的问题
    return getOtherLangTitle(pageTitle, langCode)
        .then(otherLangTitle => {
            if (!otherLangTitle) {
                console.log("[Rater] 未找到对应的" + langCode + "维基条目");
                return { noTitle: true };
            }
            
            return getTalkPageContent(otherLangTitle, langCode)
                .then(talkContent => {
                    if (!talkContent) {
                        console.log("[Rater] 未找到" + langCode + "维基条目的讨论页或讨论页为空");
                        return { noTalkPage: true };
                    }
                    
                    const bannerNames = parseProjectBanners(talkContent);
                    if (bannerNames.length === 0) {
                        console.log("[Rater] 未在" + langCode + "维基讨论页找到专题横幅");
                        return { noBanners: true };
                    }
                    
                    console.log("[Rater] 在" + langCode + "维基找到专题横幅:", bannerNames);
                    
                    // 批量查询所有模板的中文对应名称，一次跨域请求完成，替代逐个请求
                    return getTemplatesInOtherLang(bannerNames, langCode, "zh")
                        .then(mappedBanners => {
                            const validResults = mappedBanners.map(item => ({
                                name: item.name,
                                sourceLang: langCode,
                                sourceTemplate: item.sourceTemplate
                            }));
                            
                            console.log("[Rater] 找到对应的中文横幅:", validResults);
                            return validResults.length > 0 ? validResults : { noBanners: true };
                        });
                });
        })
        .catch(error => {
            console.error("[Rater] 获取其他语言专题横幅时出错:", error);
            return [];
        });
}

export { getOtherLangProjectBanners, getOtherLangTitle, getTalkPageContent, parseProjectBanners, getTemplateInOtherLang, getTemplatesInOtherLang };
// </nowiki> 
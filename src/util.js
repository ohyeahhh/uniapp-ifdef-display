const vscode = require("vscode");
const XRegExp = require("xregexp");
const window = vscode.window;
const workspace = vscode.workspace;
const fs = require("fs");
const packageJsonPath = `${decodeURI(
  vscode.workspace.workspaceFolders[0].uri
)}/package.json`;

const htmlRule = {
  start:
    "[ \t]*<!--[ \t]*#(ifndef|ifdef|if)[ \t]+(.*?)[ \t]*(?:-->|!>)(?:[ \t]*\n+)?",
  end: "[ \t]*<!(?:--)?[ \t]*#endif[ \t]*(?:-->|!>)(?:[ \t]*\n)?",
};
const scriptOrStyleRule = {
  start:
    "[ \t]*(?://|/\\*)[ \t]*#(ifndef|ifdef|if)[ \t]+([^\n*]*)(?:\\*(?:\\*|/))?(?:[ \t]*\n+)?",
  end: "[ \t]*(?://|/\\*)[ \t]*#endif[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*\n)?",
};

const updateHasIfDef = function (globalState) {
  let activeEditor = window.activeTextEditor;
  if (!activeEditor || !activeEditor.document) {
    return;
  }
  let text = activeEditor.document.getText();
  if (/#ifdef|#ifndef/.test(text)) {
    globalState.update("hasIfDef", true);
    vscode.commands.executeCommand("setContext", "hasIfDef", true);
  } else {
    globalState.update("hasIfDef", false);
    vscode.commands.executeCommand("setContext", "hasIfDef", false);
  }
};

const getConfig = function (key) {
  let settings = workspace.getConfiguration("ifdefdisplay");
  return settings.get(key);
};

const setConfig = function (key, value) {
  let settings = workspace.getConfiguration("ifdefdisplay");
  return settings.update(key, value, key !== "platformArr");
};
const DEFAULT_PLATFORM_TO_MACROS = {
  "mp-weixin": ["MP-WEIXIN", "MP"],
  "mp-baidu": ["MP-BAIDU", "MP"],
  "mp-toutiao": ["MP-TOUTIAO", "MP"],
  "mp-alipay": ["MP-ALIPAY", "MP"],
  "mp-kuaishou": ["MP-KUAISHOU", "MP"],
  "mp-lark": ["MP-LARK", "MP"],
  "mp-qq": ["MP-QQ", "MP"],
  "mp-jd": ["MP-JD", "MP"],
  "mp-360": ["MP-360", "MP"],
  "quickapp-webview": ["QUICKAPP-WEBVIEW"],
  "quickapp-html": ["QUICKAPP-WEBVIEW-UNION"],
  "quickapp-webview-huawei": ["QUICKAPP-WEBVIEW-HUAWEI"],
  h5: ["H5", "WEB"],
  WEB: ["H5", "WEB"],
  app: ["APP", "APP-PLUS", "APP-HARMONY"],
  "app-plus": ["APP-PLUS"],
  "app-harmony": ["APP-HARMONY"],
};

let platformToMacro = {};
const getAllMacro = function () {
  if (Object.keys(platformToMacro).length === 0) {
    updatePlatformToMacroMap();
  }
  let platformArr = getConfig("platformArr");
  const allMacro = platformArr.reduce((allMacro, platform) => {
    allMacro.push(...platformToMacro[platform]);
    return allMacro;
  }, []);
  return [...new Set(allMacro)];
};

const updatePlatformToMacroMap = function () {
  platformToMacro = {};
  const meta = JSON.parse(
    fs.readFileSync(packageJsonPath.replace("file://", ""))
  );
  if (
    meta["uni-app"] &&
    meta["uni-app"]["scripts"] &&
    Object.keys(meta["uni-app"]["scripts"]).length > 0
  ) {
    Object.keys(meta["uni-app"]["scripts"]).forEach((key) => {
      const baseMacros =
        DEFAULT_PLATFORM_TO_MACROS[
          meta?.["uni-app"]?.["scripts"]?.[key]?.env?.UNI_PLATFORM
        ];
      if (baseMacros) {
        platformToMacro[key] = [...baseMacros];
      } else {
        platformToMacro[key] = [];
      }
      if (meta?.["uni-app"]?.["scripts"]?.[key]?.define) {
        const userDefinedMacros = Object.keys(
          meta["uni-app"]["scripts"][key].define
        );
        if (userDefinedMacros && userDefinedMacros.length > 0) {
          platformToMacro[key].push(...userDefinedMacros);
        }
      }
    });
  }
  Object.assign(platformToMacro, DEFAULT_PLATFORM_TO_MACROS);
};

const showQuickPick = async function () {
  updatePlatformToMacroMap();
  const filterableArr = Object.keys(platformToMacro);
  const result = await window.showQuickPick(filterableArr, {
    placeHolder: "请勾选编译平台（可多选）",
    canPickMany: true,
  });
  setConfig("platformArr", result);
};

const updateStatusItemBar = function (statusItemBar, globalState) {
  let hasIfDef = globalState.get("hasIfDef", false);
  if (getConfig("isEnable") && hasIfDef) {
    let platformArr = getConfig("platformArr");
    if (platformArr.length == 0) {
      statusItemBar.text = "focus on platform：all";
    } else {
      statusItemBar.text = "focus on platform：" + platformArr.join(" ");
    }
    statusItemBar.show();
  } else {
    statusItemBar.hide();
  }
};

const getFoldingRangeList = function (document, rule) {
  let foldingRangeArr = [];
  let content = document.getText();
  function getFolding(content, startOrigin = 0) {
    let matches = XRegExp.matchRecursive(content, rule.start, rule.end, "gmi", {
      valueNames: [null, "left", "match", "right"],
    });
    let start;
    matches.forEach(function (match) {
      switch (match.name) {
        case "left":
          start = document.positionAt(match.start + startOrigin);
          break;
        case "match":
          match.start = match.start + startOrigin;
          match.end = match.end + startOrigin;
          getFolding(match.value, match.start);
          break;
        case "right":
          let end = document.positionAt(match.start + startOrigin);
          foldingRangeArr.push(new vscode.FoldingRange(start.line, end.line));
          break;
      }
    });
  }
  getFolding(content, 0);
  return foldingRangeArr;
};

module.exports = {
  htmlRule,
  scriptOrStyleRule,
  updateHasIfDef,
  getConfig,
  showQuickPick,
  updateStatusItemBar,
  getFoldingRangeList,
  getAllMacro,
};

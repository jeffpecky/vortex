#include <napi.h>
#include <dlfcn.h>
#include <string>

using GetJsonFunc = char* (*)();
using GetJsonWithIdFunc = char* (*)(int32_t);
using OpenAppFunc = int32_t (*)(const char*);
using FreeStringFunc = void (*)(char*);
using ScreenshotFunc = char* (*)(const char*, float, int32_t, int32_t, int32_t);

static void* g_dylib_handle = nullptr;

static void LoadSwiftLibrary() {
    if (g_dylib_handle) return;
    
    // Try multiple paths to find the Swift dylib
    const char* paths[] = {
        "libcomputer_use.dylib",
        "./libcomputer_use.dylib",
        "../prebuilds/libcomputer_use.dylib",
        nullptr
    };
    
    for (int i = 0; paths[i] != nullptr; i++) {
        g_dylib_handle = dlopen(paths[i], RTLD_LAZY | RTLD_GLOBAL);
        if (g_dylib_handle) break;
    }
}

static FreeStringFunc resolveFree() {
    return reinterpret_cast<FreeStringFunc>(dlsym(RTLD_DEFAULT, "computer_use_free_string"));
}

Napi::Value GetDisplaySize(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    auto func = reinterpret_cast<GetJsonWithIdFunc>(dlsym(RTLD_DEFAULT, "computer_use_display_get_size"));
    if (!func) return env.Null();
    
    int32_t id = info.Length() > 0 ? info[0].As<Napi::Number>().Int32Value() : 0;
    char* result = func(id);
    std::string json(result);
    resolveFree()(result);

    return Napi::String::New(env, json);
}

Napi::Value ListDisplays(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    auto func = reinterpret_cast<GetJsonFunc>(dlsym(RTLD_DEFAULT, "computer_use_display_list_all"));
    if (!func) return env.Null();
    
    char* result = func();
    std::string json(result);
    resolveFree()(result);

    return Napi::String::New(env, json);
}

Napi::Value ListInstalledApps(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    auto func = reinterpret_cast<GetJsonFunc>(dlsym(RTLD_DEFAULT, "computer_use_apps_list_installed"));
    if (!func) return env.Null();
    
    char* result = func();
    std::string json(result);
    resolveFree()(result);

    return Napi::String::New(env, json);
}

Napi::Value ListRunningApps(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    auto func = reinterpret_cast<GetJsonFunc>(dlsym(RTLD_DEFAULT, "computer_use_apps_list_running"));
    if (!func) return env.Null();
    
    char* result = func();
    std::string json(result);
    resolveFree()(result);

    return Napi::String::New(env, json);
}

Napi::Value OpenApp(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    auto func = reinterpret_cast<OpenAppFunc>(dlsym(RTLD_DEFAULT, "computer_use_apps_open"));
    if (!func) return env.Null();

    std::string bundleId = info[0].As<Napi::String>().Utf8Value();
    int32_t success = func(bundleId.c_str());

    return Napi::Boolean::New(env, success != 0);
}

Napi::Value CaptureExcluding(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    auto func = reinterpret_cast<ScreenshotFunc>(dlsym(RTLD_DEFAULT, "computer_use_screenshot_capture_excluding"));
    if (!func) return env.Null();

    // info[0] = allowedBundleIds (JSON string), info[1..4] = quality, targetW, targetH, displayId
    std::string allowedJson = info.Length() > 0 && info[0].IsString()
        ? info[0].As<Napi::String>().Utf8Value()
        : "[]";
    float quality = info.Length() > 1 ? info[1].As<Napi::Number>().FloatValue() : 0.9f;
    int32_t targetW = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;
    int32_t targetH = info.Length() > 3 ? info[3].As<Napi::Number>().Int32Value() : 0;
    int32_t displayId = info.Length() > 4 ? info[4].As<Napi::Number>().Int32Value() : 0;

    char* result = func(allowedJson.c_str(), quality, targetW, targetH, displayId);
    std::string json(result);
    resolveFree()(result);

    return Napi::String::New(env, json);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    LoadSwiftLibrary();
    
    Napi::Object cu = Napi::Object::New(env);
    
    Napi::Object display = Napi::Object::New(env);
    display.Set("getSize", Napi::Function::New(env, GetDisplaySize));
    display.Set("listAll", Napi::Function::New(env, ListDisplays));
    cu.Set("display", display);

    Napi::Object apps = Napi::Object::New(env);
    apps.Set("listInstalled", Napi::Function::New(env, ListInstalledApps));
    apps.Set("listRunning", Napi::Function::New(env, ListRunningApps));
    apps.Set("open", Napi::Function::New(env, OpenApp));
    cu.Set("apps", apps);

    Napi::Object screenshot = Napi::Object::New(env);
    screenshot.Set("captureExcluding", Napi::Function::New(env, CaptureExcluding));
    cu.Set("screenshot", screenshot);

    exports.Set("computerUse", cu);
    return exports;
}

NODE_API_MODULE(computer_use, Init)

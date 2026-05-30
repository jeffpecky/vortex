#include <napi.h>
#include <dlfcn.h>
#include <string>

using GetJsonFunc = char* (*)();
using GetJsonWithIdFunc = char* (*)(int32_t);
using OpenAppFunc = int32_t (*)(const char*);
using FreeStringFunc = void (*)(char*);
using ScreenshotFunc = char* (*)(const char*, float, int32_t, int32_t, int32_t);

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

    float quality = info[1].As<Napi::Number>().FloatValue();
    int32_t targetW = info[2].As<Napi::Number>().Int32Value();
    int32_t targetH = info[3].As<Napi::Number>().Int32Value();
    int32_t displayId = info[4].As<Napi::Number>().Int32Value();

    char* result = func(nullptr, quality, targetW, targetH, displayId);
    std::string json(result);
    resolveFree()(result);

    return Napi::String::New(env, json);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
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

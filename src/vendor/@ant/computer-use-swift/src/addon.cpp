#include <napi.h>
#include <string>

// Direct declarations of Swift functions (statically linked)
extern "C" {
    char* computer_use_display_get_size(int32_t displayId);
    char* computer_use_display_list_all();
    char* computer_use_apps_list_installed();
    char* computer_use_apps_list_running();
    int32_t computer_use_apps_open(const char* bundleId);
    char* computer_use_screenshot_capture_excluding(const char* allowedJson, float quality, int32_t targetW, int32_t targetH, int32_t displayId);
    void computer_use_free_string(char* str);
}

Napi::Value GetDisplaySize(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    int32_t id = info.Length() > 0 ? info[0].As<Napi::Number>().Int32Value() : 0;
    char* result = computer_use_display_get_size(id);
    std::string json(result);
    computer_use_free_string(result);
    return Napi::String::New(env, json);
}

Napi::Value ListDisplays(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    char* result = computer_use_display_list_all();
    std::string json(result);
    computer_use_free_string(result);
    return Napi::String::New(env, json);
}

Napi::Value ListInstalledApps(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    char* result = computer_use_apps_list_installed();
    std::string json(result);
    computer_use_free_string(result);
    return Napi::String::New(env, json);
}

Napi::Value ListRunningApps(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    char* result = computer_use_apps_list_running();
    std::string json(result);
    computer_use_free_string(result);
    return Napi::String::New(env, json);
}

Napi::Value OpenApp(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    std::string bundleId = info[0].As<Napi::String>().Utf8Value();
    int32_t success = computer_use_apps_open(bundleId.c_str());
    return Napi::Boolean::New(env, success != 0);
}

Napi::Value CaptureExcluding(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    std::string allowedJson = info.Length() > 0 && info[0].IsString()
        ? info[0].As<Napi::String>().Utf8Value()
        : "[]";
    float quality = info.Length() > 1 ? info[1].As<Napi::Number>().FloatValue() : 0.9f;
    int32_t targetW = info.Length() > 2 ? info[2].As<Napi::Number>().Int32Value() : 0;
    int32_t targetH = info.Length() > 3 ? info[3].As<Napi::Number>().Int32Value() : 0;
    int32_t displayId = info.Length() > 4 ? info[4].As<Napi::Number>().Int32Value() : 0;

    char* result = computer_use_screenshot_capture_excluding(allowedJson.c_str(), quality, targetW, targetH, displayId);
    std::string json(result);
    computer_use_free_string(result);
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

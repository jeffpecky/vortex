#include <napi.h>
#include <dlfcn.h>
#include <string>

using GetActiveModifiersJsonFunc = char* (*)();
using FreeStringFunc = void (*)(char*);

static GetActiveModifiersJsonFunc resolveGetJson() {
    static auto func = reinterpret_cast<GetActiveModifiersJsonFunc>(
        dlsym(RTLD_DEFAULT, "ModifiersDetector_getActiveModifiersJson"));
    return func;
}

static FreeStringFunc resolveFreeString() {
    static auto func = reinterpret_cast<FreeStringFunc>(
        dlsym(RTLD_DEFAULT, "ModifiersDetector_freeString"));
    return func;
}

Napi::Value GetActiveModifiersJson(const Napi::CallbackInfo& info) {
    auto env = info.Env();

    auto getJson = resolveGetJson();
    if (!getJson) {
        Napi::Error::New(env, "Failed to resolve ModifiersDetector_getActiveModifiersJson")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    auto freeStr = resolveFreeString();
    if (!freeStr) {
        Napi::Error::New(env, "Failed to resolve ModifiersDetector_freeString")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    char* result = getJson();
    if (!result) {
        return Napi::String::New(env, "{}");
    }

    std::string json(result);
    freeStr(result);

    return Napi::String::New(env, json);
}

NAPI_MODULE_INIT() {
    Napi::Object exports = Napi::Object::New(env);
    exports.Set("getActiveModifiersJson", Napi::Function::New(env, GetActiveModifiersJson));
    return exports;
}

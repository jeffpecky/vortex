#include <napi.h>
#include <string>

// Direct declarations of Swift functions (statically linked)
extern "C" {
    char* ModifiersDetector_getActiveModifiersJson();
    void ModifiersDetector_freeString(char* str);
}

Napi::Value GetActiveModifiersJson(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    
    char* result = ModifiersDetector_getActiveModifiersJson();
    if (!result) {
        return Napi::String::New(env, "{}");
    }
    
    std::string json(result);
    ModifiersDetector_freeString(result);
    
    return Napi::String::New(env, json);
}

NAPI_MODULE_INIT() {
    Napi::Object exportsObj(env, exports);
    exportsObj.Set("getActiveModifiersJson", Napi::Function::New(env, GetActiveModifiersJson));
    return exports;
}

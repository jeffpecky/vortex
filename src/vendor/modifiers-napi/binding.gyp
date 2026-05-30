{
  "targets": [
    {
      "target_name": "modifiers",
      "sources": ["src/addon.cpp"],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")"
      ],
      "libraries": [
        "../build/libmodifiers_static.a"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "11.0",
        "OTHER_LDFLAGS": [
          "-framework Foundation",
          "-framework AppKit",
          "-framework Carbon"
        ]
      }
    }
  ]
}

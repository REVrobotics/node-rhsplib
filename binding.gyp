{
  'targets': [
    {
      'target_name': 'addon',
      'sources': [
        'src/addon.cc',
        'src/rhsplibWrapper.cc',
        'src/serialWrapper.cc'
      ],
      'include_dirs': [
        'src/',
        'RHSPlib/',
        'RHSPlib/arch/includes/',
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [
        'NAPI_VERSION=<(napi_build_version)'
      ],
      'dependencies': [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      'libraries': [
        '<(module_root_dir)/RHSPlib/x86-64/RHSPlib.lib',
      ],
      'msvs_settings': {
        'VCCLCompilerTool': {
            'ExceptionHandling': 1,
        },
      },
      'cflags_cc!': [
        '-fno-exceptions'
      ],
      'cflags!': [
        '-fno-exceptions'
      ],
    }
  ]
}
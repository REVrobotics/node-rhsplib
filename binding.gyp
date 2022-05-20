{
  'targets': [
    {
      'target_name': 'addon',
      'sources': [
        'src/addon.cc',
        'src/rhsplibWrapper.cc'
      ],
      'include_dirs': [
        'src/',
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [
        'NAPI_VERSION=<(napi_build_version)'
      ],
      'dependencies': [
        "<!(node -p \"require('node-addon-api').gyp\")"
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
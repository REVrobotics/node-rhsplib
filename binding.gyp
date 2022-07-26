{
  'targets': [
    {
      'target_name': 'addon',
      'sources': [
        'src/addon.cc',
        'src/RevHubWrapper.cc',
        'src/serialWrapper.cc',
        'src/RHSPlibWorker.cc'
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
      'conditions': [
        [
          'OS=="win"', {
            'libraries': [
              '<(module_root_dir)/RHSPlib/x86-64/RHSPlib.lib',
            ],
            'copies':[{
              'destination': '<(PRODUCT_DIR)',
              'files':[
                '<(module_root_dir)/bin/RHSPlib.dll',
              ],
            }],
          }
        ],
        [
          'OS=="linux"', {
            'link_settings': {
              'libraries': [
                  '-L<(module_root_dir)/build/Release/',
                  '-lRHSPlib'
              ],
              'ldflags': [
                '-Wl,-rpath,<(module_root_dir)/build/Release/',
              ]
            },
            'copies':[{
              'destination': '<(PRODUCT_DIR)',
              'files':[
                '<(module_root_dir)/bin/libRHSPlib.so',
              ],
            }],
          }
        ]
      ],
      'msvs_settings': {
        'VCCLCompilerTool': {
            'ExceptionHandling': 1,
            'AdditionalOptions': [ '-std:c++17' ]
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
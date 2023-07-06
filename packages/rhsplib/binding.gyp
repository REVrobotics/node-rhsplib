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
              '<(module_root_dir)/RHSPlib/build-windows/Release/RHSPlib.lib',
            ],
            'copies':[
              {
                'destination': '<(PRODUCT_DIR)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build/Release/RHSPlib.dll',
                ],
              },
              {
                'destination': '<(module_root_dir)/prebuilds/win32-<(target_arch)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build/Release/RHSPlib.dll',
                ],
              },
            ]
         }
        ],
        [
          'OS=="linux" and target_arch=="x64"', {
            'link_settings': {
              'libraries': [
                  '-L<(module_root_dir)/RHSPlib/build-linuxX64/',
                  '-lRHSPlib'
              ],
              'ldflags': [
                '-Wl,-rpath,<(module_root_dir)/RHSPlib/build-linuxX64/',
              ]
            },
            'copies':[
              {
                'destination': '<(PRODUCT_DIR)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build-linuxX64/libRHSPlib.so',
                ],
              }
            ],
          }
        ],
        [
          'OS=="linux" and target_arch=="arm64"', {
            'link_settings': {
              'libraries': [
                  '-L<(module_root_dir)/RHSPlib/build-linuxArm64/',
                  '-lRHSPlib'
              ],
              'ldflags': [
                '-Wl,-rpath,<(module_root_dir)/RHSPlib/build-linuxArm64/',
              ]
            },
            'copies':[
              {
                'destination': '<(PRODUCT_DIR)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build-linuxArm64/libRHSPlib.so',
                ],
              }
            ],
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
        '-fno-exceptions',
      ],
      'cflags_cc': [
        '-std=c++17'
      ],
      'cflags!': [
        '-fno-exceptions'
      ],
    }
  ]
}

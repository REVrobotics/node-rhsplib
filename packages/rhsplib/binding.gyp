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
        'RHSPlib/include',
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [
        'NAPI_VERSION=<(napi_build_version)',
        'NAPI_DISABLE_CPP_EXCEPTIONS',
        'CMAKE_C_STANDARD=c++17'
      ],
      'dependencies': [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      'conditions': [
        [
          'OS=="win"', {
            'libraries': [
              '<(module_root_dir)/RHSPlib/build-windows/Release/rhsp.lib',
            ],
            'copies':[
              {
                'destination': '<(PRODUCT_DIR)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build/Release/rhsp.dll',
                ],
              },
              {
                'destination': '<(module_root_dir)/prebuilds/win32-<(target_arch)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build/Release/rhsp.dll',
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
                  '-lrhsp'
              ],
              'ldflags': [
                '-Wl,-rpath,<(module_root_dir)/RHSPlib/build-linuxX64/',
              ]
            },
            'copies':[
              {
                'destination': '<(PRODUCT_DIR)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build-linuxX64/librhsp.so',
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
                  '-lrhsp'
              ],
              'ldflags': [
                '-Wl,-rpath,<(module_root_dir)/RHSPlib/build-linuxArm64/',
              ]
            },
            'copies':[
              {
                'destination': '<(PRODUCT_DIR)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build-linuxArm64/librhsp.so',
                ],
              }
            ],
          }
        ],
        [
          'OS=="mac" and target_arch=="x64"', {
            'cflags+': ['-fvisibility=hidden', "-std=c++17"],
            'xcode_settings': {
                'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES', # -fvisibility=hidden
                'CLANG_CXX_LANGUAGE_STANDARD': 'c++17',
                'CLANG_CXX_LIBRARY': 'libc++',
                'MACOSX_DEPLOYMENT_TARGET': '10.15'
            },
            'link_settings': {
              'libraries': [
                  '-L<(module_root_dir)/RHSPlib/build-darwinX64/',
                  '-lRHSPlib'
              ],
              'ldflags': [
                '-Wl,-rpath,<(module_root_dir)/RHSPlib/build-darwinX64/',
              ]
            },
            'copies':[
              {
                'destination': '<(PRODUCT_DIR)',
                'files':[
                  '<(module_root_dir)/RHSPlib/build-darwinX64/librhsp.dylib',
                ],
              }
            ],
          }
        ],
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

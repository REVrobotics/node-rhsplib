//
// Created by landry on 7/28/23.
//

#ifndef RHSP_INTERNAL_MODULE_H
#define RHSP_INTERNAL_MODULE_H

#ifdef __cplusplus
extern "C" {
#endif

#include "rhsp/module.h"

// Module interface list queried by command queryInterface
typedef struct {
    size_t numberOfInterfaces;
    RhspModuleInterface interfaces[];
} RhspModuleInterfaceListInternal;

#ifdef __cplusplus
}
#endif

#endif //RHSP_INTERNAL_MODULE_H

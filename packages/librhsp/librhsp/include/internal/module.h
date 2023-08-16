//
// Created by landry on 7/28/23.
//

#ifndef RHSP_INTERNAL_MODULE_H
#define RHSP_INTERNAL_MODULE_H

#include "rhsp/module.h"

// Module interface list queried by command queryInterface
typedef struct {
    size_t numberOfInterfaces;
    RhspModuleInterface interfaces[];
} RhspModuleInterfaceListInternal;

#endif //RHSP_INTERNAL_MODULE_H

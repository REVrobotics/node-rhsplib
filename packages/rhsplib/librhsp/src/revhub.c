#include <memory.h>
#include <stdlib.h>
#include "rhsp/revhub.h"
#include "internal/module.h"
#include "internal/revhub.h"

#define RHSP_DEFAULT_DST_ADDRESS            1    // default destination address

int rhsp_open(RhspRevHub* hub, RhspSerial* serialPort, uint8_t destAddress)
{
    if (!hub || !serialPort)
    {
        return RHSP_ERROR;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    internalHub->serialPort = serialPort;
    internalHub->address = destAddress;

    return RHSP_RESULT_OK;
}

RhspRevHub* rhsp_allocRevHub(RhspSerial* serialPort, uint8_t destAddress)
{
    RhspRevHubInternal* hub = malloc(sizeof(RhspRevHubInternal));
    hub->messageNumber = 1;
    hub->address = RHSP_DEFAULT_DST_ADDRESS;
    hub->responseTimeoutMs = RHSP_RESPONSE_TIMEOUT_MS;

    rhsp_open((RhspRevHub*) hub, serialPort, destAddress);

    return (RhspRevHub*) hub;
}

void freeRevHub(RhspRevHub* hub)
{
    if(!hub) return; // standard free is a No-op if ptr is NULL, so let's do the same.
    free(hub);
}

bool rhsp_isOpened(const RhspRevHub* hub)
{
    if (!hub)
    {
        return false;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    return (internalHub->serialPort != NULL) ? true : false;
}

void rhsp_close(RhspRevHub* hub)
{
    if (!hub)
    {
        return;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    // add closure logic if it's needed
    internalHub->serialPort = NULL;
    RhspModuleInterfaceListInternal* list = (RhspModuleInterfaceListInternal*) internalHub->interfaceList;
    if (list)
    {
        for (int i = 0; i < list->numberOfInterfaces; i++)
        {
            free(list->interfaces[i].name);
        }
    }
    free(list);
}

void rhsp_setDestinationAddress(RhspRevHub* hub, uint8_t dstAddress)
{
    if (!hub)
    {
        return;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    internalHub->address = dstAddress;
}

uint8_t rhsp_getDestinationAddress(const RhspRevHub* hub)
{
    if (!hub)
    {
        return 0;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    return internalHub->address;
}

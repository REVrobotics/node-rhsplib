/*
 *  time.c
 *
 *  Created on: Dec 3, 2020
 *      Author: user
 */
#include <windows.h>

#include "rhsp/time.h"


uint32_t rhsp_getSteadyClockMs(void)
{
    return GetTickCount();
}

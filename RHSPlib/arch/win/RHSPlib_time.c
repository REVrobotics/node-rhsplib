/*
 * RHSPlib_time.c
 *
 *  Created on: Dec 3, 2020
 *      Author: user
 */
#include <windows.h>

// @TODO fix build error when compiler is included
//#include "RHSPlib_compiler.h"
#include "RHSPlib_time.h"


uint32_t RHSPlib_time_getSteadyClockMs(void)
{
    return GetTickCount();
}

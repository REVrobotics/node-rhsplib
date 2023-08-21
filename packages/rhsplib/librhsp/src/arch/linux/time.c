/*
 * time.c
 *
 *  Created on: Dec 3, 2020
 *      Author: user
 */
#include <time.h>

#include "rhsp/time.h"

uint32_t rhsp_getSteadyClockMs(void)
{
    struct timespec time_spec;

    int retval = clock_gettime(CLOCK_MONOTONIC, &time_spec);
    //rhsp_assert(retval >= 0);
    if (retval < 0)
        return 0;
    return time_spec.tv_sec * 1000UL + time_spec.tv_nsec / 1000000UL;
}

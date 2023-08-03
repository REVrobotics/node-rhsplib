/*
 * rhsp_time.h
 *
 *  Created on: Dec 3, 2020
 *  Author: Andrey Mihadyuk
 */

#ifndef ARCH_INCLUDES_RHSP_TIME_H_
#define ARCH_INCLUDES_RHSP_TIME_H_

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief  steady clock in milliseconds
 * @details return steady(monotonic) clock in milliseconds.
 *
 * @return steady time in milliseconds
 *
 * */
uint32_t rhsp_getSteadyClockMs(void);

#ifdef __cplusplus
}
#endif


#endif /* ARCH_INCLUDES_RHSP_TIME_H_ */

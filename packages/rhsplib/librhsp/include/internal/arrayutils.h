#ifndef RHSP_ARRAYUTILS_H
#define RHSP_ARRAYUTILS_H

#ifdef __cplusplus
extern "C" {
#endif

// helper functions to set/get byte, word, dword values from payload
#define RHSP_ARRAY_BYTE(type, buffer, index)       ((type)(buffer)[index])
#define RHSP_ARRAY_BYTE_PTR(type, buffer, index)   (&((type)(buffer))[index])
#define RHSP_ARRAY_WORD(type, buffer, startIndex)  ((type)(buffer)[startIndex] | ((type)(buffer)[(startIndex) + 1] << 8))
#define RHSP_ARRAY_DWORD(type, buffer, startIndex) ((type)(buffer)[startIndex] | \
                                                       ((type)(buffer)[(startIndex) + 1] << 8)  | \
                                                       ((type)(buffer)[(startIndex) + 2] << 16) | \
                                                       ((type)(buffer)[(startIndex) + 3] << 24))

#define RHSP_ARRAY_SET_BYTE(buffer, index, value)  do { (buffer)[index] = (uint8_t)(value); } while(0)
#define RHSP_ARRAY_SET_WORD(buffer, index, value)  do { (buffer)[index]     = (uint8_t)(value); \
                                                            (buffer)[index + 1] = (uint16_t)(value) >> 8; \
                                                          } while(0)
#define RHSP_ARRAY_SET_DWORD(buffer, index, value)  do { (buffer)[index]     = (uint8_t)(value); \
                                                             (buffer)[index + 1] = (uint32_t)(value) >> 8; \
                                                             (buffer)[index + 2] = (uint32_t)(value) >> 16; \
                                                             (buffer)[index + 3] = (uint32_t)(value) >> 24; \
                                                          } while(0)

#ifdef __cplusplus
}
#endif

#endif //RHSP_ARRAYUTILS_H

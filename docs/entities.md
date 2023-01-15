# Entities

In the context of DiscDoor, items such as `User` or `Message` objects are considered entities.

Entities have the following characteristics:
 - They are loosely linked. The messaging service (which mainly handles `Message` objects) does not need to know how a `User` object works. The user object just needs to guarantee that it can be referred to by its entity ID. The associations are created and understood by the gateway.

 - They are highly cachable. `User` objects, `Message` objects, and `Channel` objects do not change very often, which therefore makes them easy to cache.

 - They always have an ID. Each known entity in the DiscDoor architecture has an ID which identifies it. The ID is based on the current system time stamp and offset from the last created object.

## Caching of entities

Entities are cached using a `Cacher` object in the gateway. This cacher object can either only retrieve objects from the cache, or primarily fetch from the cache and only fetch remotely if there is no locally cached entity.

Caching is incredibly important in a primarily realtime service such as the gateway, since any speed boost is welcome (DB hits are expensive when done in bulk).